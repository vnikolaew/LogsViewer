namespace LogViewer.Models;

public class LogFileInfo
{
    public string FileName { get; set; } = default!;

    public string FileRelativePath { get; set; } = default!;

    public long FileSize { get; set; }
    public DateTime LastWriteTime { get; set; }
}