using LogViewer.Models;

namespace LogViewer.Hubs.Models;

public record LogsUpdate(
    Guid SubscriptionId,
    string ServiceName,
    string LogFileName,
    IEnumerable<LogLine> Logs,
    long OldFilePosition,
    long NewFilePosition,
    LogUpdateType UpdateType)
{
    public static LogsUpdate New(Guid subscriptionId, string serviceName, string logFileName, IEnumerable<LogLine> logs,
        long oldFilePosition, long newFilePosition)
        => new(subscriptionId, serviceName, logFileName, logs, oldFilePosition, newFilePosition, LogUpdateType.New);

    public static LogsUpdate Truncate(Guid subscriptionId, string serviceName, string logFileName,
        IEnumerable<LogLine> logs,
        long oldFilePosition, long newFilePosition)
        => new(subscriptionId, serviceName, logFileName, logs, oldFilePosition, newFilePosition, LogUpdateType.Truncate);

    public static LogsUpdate NoChange(Guid subscriptionId, string serviceName, string logFileName,
        IEnumerable<LogLine> logs,
        long oldFilePosition, long newFilePosition)
        => new(subscriptionId, serviceName, logFileName, logs, oldFilePosition, newFilePosition, LogUpdateType.NoChange);
}

public enum LogUpdateType : sbyte
{
    New = 0,
    Truncate = 1,
    NoChange = 2
}