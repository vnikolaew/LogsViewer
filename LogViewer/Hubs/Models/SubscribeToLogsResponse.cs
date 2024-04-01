using LogViewer.Hubs.Models.Common;

namespace LogViewer.Hubs.Models;

public record SubscribeToLogsResponse(
    Guid SubscriptionId,
    bool Success,
    string Message,
    string ServiceName,
    string ConnectionId) : BaseResponse(Success, Message);
public record UnsubscribeToLogsResponse(
    Guid SubscriptionId,
    bool Success,
    string Message,
    string ServiceName,
    string ConnectionId) : BaseResponse(Success, Message);
