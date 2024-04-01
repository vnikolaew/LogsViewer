namespace LogViewer.Hubs.Models;

public record SubscribeToLogsResponse(
    bool Success,
    string Message,
    string ServiceName,
    string ConnectionId);
    
    
public record UnsubscribeToLogsResponse(
    bool Success,
    string Message,
    string ServiceName,
    string ConnectionId);
