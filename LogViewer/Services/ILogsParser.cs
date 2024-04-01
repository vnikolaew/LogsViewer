using LogViewer.Models;

namespace LogViewer.Services;

public interface ILogsParser
{
    IEnumerable<LogLine> Parse(IEnumerable<string> logLines);

    bool TryParse(string logLine, out LogLine? log);
    
    LogLine? ToLog(string logLine);
}