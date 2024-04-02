using System.Collections.Concurrent;
using System.Text;
using LogViewer.Hubs.Models;
using LogViewer.Infrastructure;
using LogViewer.Models;
using LogViewer.Services;
using LogViewer.Services.Parsing;
using LogViewer.Settings;
using Microsoft.AspNetCore.SignalR;

namespace LogViewer.Hubs;

public interface ILogsClient
{
    Task SendUpdates(
        LogsUpdate logsUpdate,
        CancellationToken cancellationToken);

    Task UpdateFilePosition(
        UpdateFilePositionResponse updateFilePositionResponse,
        CancellationToken cancellationToken);

    Task TestMethod(string value);
}

internal sealed class LogsHub(
    IWebHostEnvironment webHostEnvironment,
    LogConfigurations logConfigurations,
    ILogsParser<LogLine> logsParser,
    ILogger<LogsHub> logger)
    : Hub<ILogsClient>
{
    public static ConcurrentDictionary<string, ISet<FileLogsSubscription>> Subscriptions { get; set; }
        = new();

    private const string LogsFolder = "logs";

    private const string LogFilesFilter = "*.log";

    public const string Endpoint = $"/{LogsFolder}";

    [HubMethodName("UpdateFilePosition")]
    // NOTE: Still only works with a single service log file:
    public async Task UpdateFilePositionAsync(
        string serviceName,
        long filePosition,
        CancellationToken cancellationToken)
    {
        var success = Subscriptions
            .TryGetValue(serviceName, out var subscriptions);

        if (!success)
        {
            await Clients.Caller
                .UpdateFilePosition(
                    UpdateFilePositionResponse.Failure(Context.ConnectionId, serviceName, filePosition),
                    cancellationToken);
            return;
        }

        var subscription = subscriptions!
            .FirstOrDefault(s => s.ConnectionId == Context.ConnectionId);
        if (subscription is null)
        {
            await Clients.Caller
                .UpdateFilePosition(
                    UpdateFilePositionResponse.Failure(
                        Context.ConnectionId, serviceName, filePosition), cancellationToken);
            return;
        }

        var logFileName = new DirectoryInfo(
                Path.Combine(webHostEnvironment.ContentRootPath, LogsFolder, serviceName, "Logs"))
            .GetLastWrittenFileName(LogFilesFilter);

        var logFileSize = logFileName.GetFileSize();
        if (filePosition < 0 || filePosition > logFileSize)
        {
            await Clients.Caller.UpdateFilePosition(
                UpdateFilePositionResponse.Failure(
                    Context.ConnectionId, serviceName, filePosition), cancellationToken);
            return;
        }

        subscription.CurrentFilePosition = filePosition;

        await Clients.Caller
            .UpdateFilePosition(
                UpdateFilePositionResponse.Success(Context.ConnectionId, serviceName, filePosition),
                cancellationToken);
    }

    [HubMethodName("Subscribe")]
    public async Task<SubscribeToLogsResponse> SubscribeAsync(string serviceName)
    {
        Subscriptions.TryAdd(serviceName, new HashSet<FileLogsSubscription>());
        if (Subscriptions[serviceName].Contains(new FileLogsSubscription { ConnectionId = Context.ConnectionId }))
        {
            var subscription = Subscriptions[serviceName].FirstOrDefault(s => s.ConnectionId == Context.ConnectionId)!;

            return new SubscribeToLogsResponse(
                subscription.SubscriptionId,
                false,
                "You are already subscribed",
                serviceName,
                Context.ConnectionId);
        }

        var logFileName = new DirectoryInfo(
                Path.Combine(webHostEnvironment.ContentRootPath, LogsFolder, serviceName, "Logs"))
            .GetLastWrittenFileName(LogFilesFilter);

        var logsSubscription = new FileLogsSubscription
        {
            ConnectionId = Context.ConnectionId,
            SubscriptionId = Guid.NewGuid(),
            CurrentFilePosition = logFileName.GetFileSize()
        };
        Subscriptions[serviceName].Add(logsSubscription);

        await Groups.AddToGroupAsync(Context.ConnectionId, $"{serviceName}_logs", CancellationToken.None);

        // Send whole log file contents:
        var buffer = await File.ReadAllBytesAsync(logFileName);
        var logs = logsParser.Parse(
            Encoding.UTF8.GetString(buffer)
                .Trim()
                .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries),
            logConfigurations.Configurations[serviceName]);

        await Clients.Caller.SendUpdates(LogsUpdate.New(
            logsSubscription.SubscriptionId,
            serviceName,
            logFileName,
            logs,
            0L, buffer.Length
        ), CancellationToken.None);

        return new SubscribeToLogsResponse(
            logsSubscription.SubscriptionId,
            true,
            "Successfully subscribed",
            serviceName,
            Context.ConnectionId);
    }

    [HubMethodName("Unsubscribe")]
    public async Task<UnsubscribeToLogsResponse> UnsubscribeAsync(string serviceName)
    {
        Subscriptions.TryAdd(serviceName, new HashSet<FileLogsSubscription>());
        if (!Subscriptions[serviceName].Contains(new FileLogsSubscription { ConnectionId = Context.ConnectionId }))
        {
            return new UnsubscribeToLogsResponse(
                Guid.Empty,
                false,
                "Could not unsubscribe", serviceName, Context.ConnectionId);
        }

        var existingSubscription =
            Subscriptions[serviceName].FirstOrDefault(s => s.ConnectionId == Context.ConnectionId)!;
        Subscriptions[serviceName].Remove(existingSubscription);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{serviceName}_logs", CancellationToken.None);

        return new UnsubscribeToLogsResponse(
            existingSubscription.SubscriptionId,
            true,
            "Successfully unsubscribed", serviceName, Context.ConnectionId);
    }

    [HubMethodName("GetAllLogs")]
    public async Task<ServiceLogsResponse> GetAllLogsAsync(string serviceName)
    {
        var serviceExists = new DirectoryInfo(
                Path.Combine(webHostEnvironment.ContentRootPath, LogsFolder))
            .GetDirectories()
            .Any(di => di.Name.Equals(serviceName, StringComparison.OrdinalIgnoreCase));

        if (serviceExists)
        {
            var lastWrittenLogFile = new DirectoryInfo(
                    Path.Combine(webHostEnvironment.ContentRootPath, LogsFolder, serviceName, "Logs"))
                .GetLastWrittenFileName("*.log");

            var serviceLogs = logsParser.Parse(
                Encoding.UTF8.GetString(await File.ReadAllBytesAsync(lastWrittenLogFile))
                    .Trim()
                    .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries),
                logConfigurations.Configurations[serviceName]).ToList();

            return ServiceLogsResponse.Success("Success", serviceName, serviceLogs);
        }

        return ServiceLogsResponse.Failure("Failure", serviceName, []);
    }

    [HubMethodName(nameof(TestMethod))]
    // Usage with Typescript client: hubConnection.invoke()
    public async Task<string> TestMethod(string value)
    {
        await Clients.Caller.TestMethod(value);
        return value;
    }

    public override Task OnConnectedAsync()
    {
        var username = Context.User is null ? string.Empty : Context.User.Identity?.Name;

        logger.LogInformation(
            "{HubName} new connection with Id '{ConnectionId}' and username '{Username}'",
            GetType().Name,
            Context.ConnectionId,
            username);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        foreach (var (_, subscriptions) in Subscriptions)
        {
            var targetSub = new FileLogsSubscription { ConnectionId = Context.ConnectionId };
            subscriptions.Remove(targetSub);
        }

        return Task.CompletedTask;
    }
}