namespace LogViewer.Models;

public interface ILogLine
{
    public string RawContent { get; }
}

public record LogLine(
    long FileIndex,
    DateTime Timestamp,
    int ProcessId,
    int ThreadId,
    LogLevel LogLevel,
    string Message,
    string RawContent) : ILogLine
{
    public int ContentLength => RawContent.Length;
};

public enum LogLevel : sbyte
{
    Info = 0,
    Debug = 1,
    Error = 2,
    Warn = 3,
}