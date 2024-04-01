using LogViewer.Hubs.Models.Common;
using LogViewer.Models;

namespace LogViewer.Hubs.Models;

public record ServiceLogsResponse(bool IsSuccess, string Message, string ServiceName, IEnumerable<LogLine> Logs)
    : BaseResponse(IsSuccess, Message)
{
    public static ServiceLogsResponse Success(string message, string serviceName, IEnumerable<LogLine> logs)
        => new (true, message, serviceName, logs);
    
    public static ServiceLogsResponse Failure(string message, string serviceName, IEnumerable<LogLine> logs)
        => new (false, message, serviceName, logs);
}