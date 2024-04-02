namespace LogViewer.Services.Parsing;

public class SsiLogsConfiguration : ILogConfiguration
{
    public string ServiceName { get; set; }

    public string LogFormat => @"{date:date}\s{time:time}\s\[{process_id:int}-{thread_id:int}\]\s{log_level:logLevel}\s|\s{content:string}";
    
    // Date -> \\d{4}-\\d{2}-\\d{2}
    // Time -> \\d{2}:\\d{2}:\\d{2}\\.\\d{4}
    // Process ID -> \\d+
    // Thread ID -> \\d+
    // Log Level -> INFO|DEBUG|ERROR|WARN
    // Content -> .*
    
    // "^(?<datetime>\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d{4})\\s\\[(?<process_thread>\\d+-\\d+)\\]\\s(?<log_level>INFO|DEBUG|ERROR|WARN)\\s\\|\\s(?<message>.*)$")]
}