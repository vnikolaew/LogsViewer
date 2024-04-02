namespace LogViewer.Models;

public class ServiceLogTree
{
    public string ServiceName { get; set; } = default!;

    public string FolderRelativePath { get; set; } = default!;

    public List<LogFileInfo> LogFiles { get; set; } = [];

    public long TotalLogFilesCount { get; set; }
}