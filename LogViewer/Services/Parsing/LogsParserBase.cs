using LogViewer.Models;
using LogLevel = LogViewer.Models.LogLevel;

namespace LogViewer.Services.Parsing;

public abstract class LogsParserBase<TLogLine> : ILogsParser<TLogLine>
    where TLogLine : ILogLine
{
    protected readonly Dictionary<string, string> RegexFormats = new()
    {
        { "date", "\\d{4}-\\d{2}-\\d{2}" },
        { "time", "\\d{2}:\\d{2}:\\d{2}\\.\\d{4}" },
        { "int", "\\d+" },
        { "logLevel", "INFO|DEBUG|ERROR|WARN" },
        { "string", ".*" },
    };

    protected readonly Dictionary<string, Type> RegexTypes = new()
    {
        { "date", typeof(DateOnly) },
        { "time", typeof(TimeOnly) },
        { "int", typeof(int) },
        { "logLevel", typeof(LogLevel) },
        { "string", typeof(string) },
    };

    protected readonly Dictionary<string, Func<string, object>> Parsers = new()
    {
        { "date", s => DateOnly.TryParse(s, out var dateOnly) ? dateOnly : default },
        { "time", s => TimeOnly.TryParse(s, out var dateOnly) ? dateOnly : default },
        { "int", s => int.TryParse(s, out var x) ? x : default },
        { "logLevel", s => Enum.TryParse(s, ignoreCase: true, out LogLevel logLevel) ? logLevel : default },
        { "string", s => s }
    };

    public abstract IEnumerable<TLogLine> Parse(IEnumerable<string> logLines, ILogConfiguration logConfiguration);

    public abstract bool TryParse(string logLine, ILogConfiguration configuration, out TLogLine? log);

    public abstract TLogLine? ToLog(string logLine);
}