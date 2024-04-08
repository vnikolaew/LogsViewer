using System.Text;
using LogViewer.Hubs;
using LogViewer.Hubs.Models;
using LogViewer.Models;
using LogViewer.Services.Parsing;
using LogViewer.Settings;
using Microsoft.AspNetCore.SignalR;

namespace LogViewer.Services;

internal sealed class LogsNotifier : BackgroundService, IHostedLifecycleService
{
    private const string LogsFolder = "logs";

    private readonly PeriodicTimer _timer = new(TimeSpan.FromSeconds(5), TimeProvider.System);

    private readonly ManualResetEventSlim _manualReset = new(false);

    private readonly FileSystemWatcher _fileSystemWatcher;

    private readonly IHubContext<LogsHub, ILogsClient> _hubContext;

    private readonly ILogsParser<LogLine> _logsParser;

    private readonly ILogger<LogsNotifier> _logger;

    private readonly LogConfigurations _logConfigurations;

    public LogsNotifier(
        IWebHostEnvironment environment,
        IHubContext<LogsHub, ILogsClient> hubContext,
        ILogsParser<LogLine> logsParser,
        ILogger<LogsNotifier> logger, LogConfigurations logConfigurations)
    {
        _hubContext = hubContext;
        _logsParser = logsParser;
        _logger = logger;
        _logConfigurations = logConfigurations;
        _fileSystemWatcher = new FileSystemWatcher
        {
            Path = Path.Combine(environment.ContentRootPath, LogsFolder),
            Filter = "*.log",
            EnableRaisingEvents = true,
            IncludeSubdirectories = true,
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastAccess | NotifyFilters.LastWrite |
                           NotifyFilters.CreationTime | NotifyFilters.DirectoryName
        };

        _fileSystemWatcher.Changed += (_, args) => OnFileChanged(args);
        _fileSystemWatcher.Created += (_, args) => OnFileCreated(args);
    }

    private async Task OnFileCreated(FileSystemEventArgs args)
    {
        var fileInfo = new FileInfo(args.FullPath);
        var serviceName = fileInfo.Directory!.Parent!.Name.Trim();

        // Get service name by folder;
        var success = LogsHub.Subscriptions
            .TryGetValue(
                serviceName,
                out var subscriptions);
        if (!success) return;

        foreach (var fileLogsSubscription in subscriptions!)
        {
            var connectionId = fileLogsSubscription.ConnectionId;
            var connectionFilePosition = fileLogsSubscription.CurrentFilePosition;
            var subscriptionId = fileLogsSubscription.SubscriptionId;

            await _hubContext
                .Clients
                .Client(connectionId)
                .SendUpdates(
                    LogsUpdate.NewFile(
                        subscriptionId,
                        serviceName,
                        fileInfo.Name,
                        [],
                        connectionFilePosition,
                        connectionFilePosition
                    ),
                    CancellationToken.None);
        }
    }

    private async Task OnFileChanged(FileSystemEventArgs args)
    {
        if (!_manualReset.IsSet) return;

        var fullFileName = args.FullPath;
        _logger.LogInformation("Notifying clients about a log change in file: {FileName}", fullFileName);

        var fileInfo = new FileInfo(fullFileName);
        var serviceName = fileInfo.Directory!.Parent!.Name.Trim();

        // Get service name by folder;
        var success = LogsHub.Subscriptions
            .TryGetValue(
                serviceName,
                out var subscriptions);

        if (success)
        {
            await using var stream = File.OpenRead(args.FullPath);

            // Use the min file position and start reading from there:
            var minFilePosition = subscriptions!
                .MinBy(s => s.CurrentFilePosition)!
                .CurrentFilePosition;

            LogLine[] logs = [];
            if (minFilePosition < stream.Length)
            {
                stream.Seek(minFilePosition, SeekOrigin.Begin);

                var buffer = new byte[fileInfo.Length - minFilePosition];
                var bytesRead = await stream.ReadAsync(buffer);

                var logLines = Encoding.UTF8.GetString(buffer)
                    .Trim()
                    .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries);
                logs = _logsParser.Parse(logLines, _logConfigurations.Services[serviceName]).ToArray();
            }

            foreach (var fileLogsSubscription in subscriptions!)
            {
                var connectionId = fileLogsSubscription.ConnectionId;
                var connectionFilePosition = fileLogsSubscription.CurrentFilePosition;
                var subscriptionId = fileLogsSubscription.SubscriptionId;

                if (connectionFilePosition == fileInfo.Length)
                {
                    await _hubContext
                        .Clients
                        .Client(connectionId)
                        .SendUpdates(
                            LogsUpdate.NoChange(
                                subscriptionId,
                                serviceName,
                                fileInfo.Name,
                                logs,
                                connectionFilePosition,
                                stream.Length
                            ),
                            CancellationToken.None);
                }
                else if (connectionFilePosition > fileInfo.Length)
                {
                    // Notify client they have to delete some logs by sending all file logs:
                    logs = _logsParser.Parse(Encoding.UTF8.GetString(await File.ReadAllBytesAsync(fileInfo.FullName))
                                .Trim()
                                .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries),
                            _logConfigurations.Services[serviceName])
                        .ToArray();

                    await _hubContext
                        .Clients
                        .Client(connectionId)
                        .SendUpdates(
                            LogsUpdate.Truncate(
                                subscriptionId,
                                serviceName,
                                fileInfo.Name,
                                logs,
                                connectionFilePosition,
                                stream.Length
                            ),
                            CancellationToken.None);
                }
                else
                {
                    // Send lines to client using the already read buffer:
                    var logIndex = 0;
                    var currentLogPosition = minFilePosition;
                    while (logIndex < logs.Length && currentLogPosition < connectionFilePosition)
                    {
                        currentLogPosition += logs[logIndex++].ContentLength;
                    }

                    await _hubContext
                        .Clients
                        .Client(connectionId)
                        .SendUpdates(
                            LogsUpdate.New(
                                subscriptionId,
                                serviceName,
                                fileInfo.Name,
                                logs[logIndex..],
                                connectionFilePosition,
                                stream.Length),
                            CancellationToken.None);
                }

                // Set new position for the current connection:
                fileLogsSubscription.CurrentFilePosition = fileInfo.Length;
            }
        }

        _manualReset.Reset();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested
               && await _timer.WaitForNextTickAsync(stoppingToken))
        {
            _manualReset.Set();
        }
    }

    public Task StartedAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("A log from {Name} ", nameof(LogsNotifier));
        return Task.CompletedTask;
    }

    public Task StartingAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public Task StoppedAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("A log from {Name} ", nameof(LogsNotifier));
        return Task.CompletedTask;
    }

    public Task StoppingAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}