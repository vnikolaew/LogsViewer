﻿using System.Text;
using LogViewer.Hubs;
using LogViewer.Hubs.Models;
using LogViewer.Models;
using Microsoft.AspNetCore.SignalR;

namespace LogViewer.Services;

internal sealed class LogsNotifier : BackgroundService
{
    private const string LogsFolder = "logs";

    private readonly PeriodicTimer _timer = new(TimeSpan.FromSeconds(5), TimeProvider.System);

    private readonly ManualResetEventSlim _manualReset = new(false);

    private readonly FileSystemWatcher _fileSystemWatcher;

    private readonly IHubContext<LogsHub, ILogsClient> _hubContext;

    private readonly ILogsParser _logsParser;

    private readonly ILogger<LogsNotifier> _logger;

    public LogsNotifier(
        IWebHostEnvironment environment,
        IHubContext<LogsHub, ILogsClient> hubContext,
        ILogsParser logsParser,
        ILogger<LogsNotifier> logger)
    {
        _hubContext = hubContext;
        _logsParser = logsParser;
        _logger = logger;
        _fileSystemWatcher = new FileSystemWatcher
        {
            Path = Path.Combine(environment.ContentRootPath, LogsFolder),
            Filter = "*.log",
            EnableRaisingEvents = true,
            IncludeSubdirectories = true,
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastAccess | NotifyFilters.LastWrite
        };

        _fileSystemWatcher.Changed += (_, args) => OnFileChanged(args);
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
                logs = _logsParser.Parse(logLines).ToArray();
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
                            .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries))
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
}