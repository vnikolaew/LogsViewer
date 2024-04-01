namespace LogViewer.Hubs.Models;

public class FileLogsSubscription : IEquatable<FileLogsSubscription>
{
    public string ConnectionId { get; init; } = default!;

    public long CurrentFilePosition { get; set; }

    public override int GetHashCode()
        => HashCode.Combine(ConnectionId);

    public bool Equals(FileLogsSubscription? other)
    {
        if (ReferenceEquals(null, other)) return false;
        if (ReferenceEquals(this, other)) return true;
        
        return ConnectionId == other.ConnectionId;
    }

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(null, obj)) return false;
        if (ReferenceEquals(this, obj)) return true;
        
        return obj.GetType() == GetType() && Equals((FileLogsSubscription)obj);
    }
}