using LogViewer.Models;

namespace LogViewer.Hubs.Models;

public record LogsUpdate(
    string ServiceName,
    string LogFileName,
    IEnumerable<LogLine> Logs,
    long OldFilePosition,
    long NewFilePosition);