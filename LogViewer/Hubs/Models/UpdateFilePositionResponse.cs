namespace LogViewer.Hubs.Models;

public record UpdateFilePositionResponse(
    bool IsSuccess,
    string ConnectionId,
    string ServiceName,
    long NewFilePosition
)
{
    public static UpdateFilePositionResponse Success(string connectionId, string serviceName, long newFilePosition) =>
        new(true, connectionId, serviceName, newFilePosition);
    
    public static UpdateFilePositionResponse Failure(string connectionId, string serviceName, long newFilePosition) =>
        new(false, connectionId, serviceName, newFilePosition);
};