using System.Text.RegularExpressions;
using LogViewer.Models;
using LogLevel = LogViewer.Models.LogLevel;

namespace LogViewer.Services;

internal sealed partial class LogsParser : ILogsParser
{
    public IEnumerable<LogLine> Parse(IEnumerable<string> logLines)
    {
        foreach (var logLine in logLines)
        {
            if (TryParse(logLine, out var log))
            {
                yield return log!;
            }
        }
    }

    public bool TryParse(string logLine, out LogLine? log)
    {
        log = default;

        var logRegex = LogRegex();
        var match = logRegex.Match(logLine);
        if (match.Success)
        {
            var success = DateTime.TryParse(match.Groups["datetime"].ValueSpan, out var dateTime);
            var processThreadParts = match.Groups["process_thread"].Value.Trim().Split("-");

            var processId = int.Parse(processThreadParts[0]);
            var threadId = int.Parse(processThreadParts[1]);
            var logLevelSuccess = Enum.TryParse<LogLevel>(
                match.Groups["log_level"].ValueSpan, true,
                out var logLevel);
            var logContent = match.Groups["message"].Value;

            if (success && logLevelSuccess)
            {
                log = new LogLine(default, dateTime, processId, threadId, logLevel, logContent, logLine.Trim());
                return true;
            }
        }

        return false;
    }

    public LogLine? ToLog(string logLine)
        => TryParse(logLine, out var log) ? log : default;

    [GeneratedRegex(
        "^(?<datetime>\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d{4})\\s\\[(?<process_thread>\\d+-\\d+)\\]\\s(?<log_level>INFO|DEBUG|ERROR|WARN)\\s\\|\\s(?<message>.*)$")]
    private static partial Regex LogRegex();
}