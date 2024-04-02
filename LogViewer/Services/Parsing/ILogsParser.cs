using LogViewer.Models;

namespace LogViewer.Services.Parsing;

public interface ILogsParser<TLogLine>
    where TLogLine : ILogLine
{
    IEnumerable<TLogLine> Parse(IEnumerable<string> logLines, ILogConfiguration logConfiguration);

    bool TryParse(string logLine, ILogConfiguration logConfiguration, out TLogLine? log);

    TLogLine? ToLog(string logLine);
}