namespace LogViewer.Hubs.Models.Common;

public abstract record BaseResponse(
    bool Success,
    string Message
);