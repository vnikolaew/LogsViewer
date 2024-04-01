namespace LogViewer.Infrastructure;

public static class FileExtensions
{
    public static string GetLastWrittenFileName(
        this DirectoryInfo directoryInfo, string searchPattern = "*")
        => directoryInfo
            .GetFiles(searchPattern)
            .MaxBy(f => f.LastWriteTime)!
            .FullName;

    public static long GetFileSize(this string fileName)
        => File.Exists(fileName) ? new FileInfo(fileName).Length : default;
}