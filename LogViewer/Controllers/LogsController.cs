using System.Text;
using LogViewer.Services;
using Microsoft.AspNetCore.Mvc;
using DirectoryInfo = System.IO.DirectoryInfo;

namespace LogViewer.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class LogsController : ControllerBase
{
    private readonly string _rootLogsFolder;

    private readonly ILogsParser _logsParser;

    public LogsController(IHostEnvironment environment, ILogsParser logsParser)
    {
        _logsParser = logsParser;
        _rootLogsFolder = Path.Combine(environment.ContentRootPath, "logs");
    }

    public class ServiceLogTree
    {
        public string ServiceName { get; set; } = default!;

        public string FolderRelativePath { get; set; } = default!;

        public List<LogFileInfo> LogFiles { get; set; } = [];

        public long TotalLogFilesCount { get; set; }
    }

    public class LogFileInfo
    {
        public string FileName { get; set; } = default!;

        public string FileRelativePath { get; set; } = default!;

        public long FileSize { get; set; }
        public DateTime LastWriteTime { get; set; }
    }


    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var serviceNames = new DirectoryInfo(_rootLogsFolder)
            .GetDirectories("*")
            .Where(di => di.GetDirectories().Any(d => d.Name.Trim() == "Logs"))
            .Select(di => di.Name.Trim())
            .ToList();

        return Ok(new { Services = serviceNames });
    }

    [HttpGet("{serviceName}/{logFile}")]
    public async Task<IActionResult> GetLogFile(string serviceName, string logFile)
    {
        var logFileInfo = new DirectoryInfo(
                Path.Combine(_rootLogsFolder, serviceName, "Logs"))
            .GetFiles("*.log")
            .FirstOrDefault(fi => fi.Name == logFile);

        if (logFileInfo is null) return BadRequest();
        return Ok(new
        {
            FileInfo = new LogFileInfo
            {
                LastWriteTime = logFileInfo.LastWriteTimeUtc,
                FileSize = logFileInfo.Length,
                FileName = logFileInfo.FullName.Replace(Path.DirectorySeparatorChar, '/'),
                FileRelativePath = Path.Combine("logs", serviceName, "Logs", logFileInfo.Name)
                    .Replace(Path.DirectorySeparatorChar, '/')
            },
            Logs = _logsParser.Parse(
                Encoding.UTF8.GetString(await System.IO.File.ReadAllBytesAsync(logFileInfo.FullName))
                    .Trim()
                    .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries)
            ).ToList()
        });
    }

    [HttpGet("{serviceName}/files")]
    public async Task<IActionResult> GetLogFiles(string serviceName, [FromQuery] int offset, [FromQuery] int limit)
    {
        var allLogFiles = new DirectoryInfo(Path.Combine(_rootLogsFolder, serviceName, "Logs"))
            .GetFiles("*.log");

        var serviceLogFiles = allLogFiles
            .OrderByDescending(fi => fi.LastWriteTimeUtc)
            .Skip(offset)
            .Take(limit)
            .Select(fi => new LogFileInfo
            {
                LastWriteTime = fi.LastWriteTimeUtc,
                FileSize = fi.Length,
                FileName = fi.Name,
                FileRelativePath = Path.Combine("logs", serviceName, "Logs", fi.Name)
                    .Replace(Path.DirectorySeparatorChar, '/')
            });

        return Ok(new { Files = serviceLogFiles, HasMore = allLogFiles.Length > offset + limit });
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetLogsTree()
    {
        var serviceLogTrees = new DirectoryInfo(_rootLogsFolder)
            .GetDirectories()
            .Select(di => new ServiceLogTree
            {
                ServiceName = di.Name.Trim(),
                FolderRelativePath = Path.Combine("logs", di.Name).Replace(Path.DirectorySeparatorChar, '/'),
                TotalLogFilesCount = di.GetDirectories("Logs")[0].GetFiles("*.log").Length,
                LogFiles = di.GetDirectories("Logs")[0]
                    .GetFiles("*.log")
                    .OrderByDescending(fi => fi.LastWriteTimeUtc)
                    .Take(10)
                    .Select(fi => new LogFileInfo
                    {
                        LastWriteTime = fi.LastWriteTimeUtc,
                        FileSize = fi.Length,
                        FileName = fi.Name,
                        FileRelativePath = Path.Combine("logs", di.Name, "Logs", fi.Name)
                            .Replace(Path.DirectorySeparatorChar, '/'),
                    }).ToList()
            })
            .ToList();

        return Ok(new { Tree = serviceLogTrees });
    }

    [HttpGet("{logFolder}")]
    public async Task<IActionResult> Test(
        [FromRoute] string logFolder,
        CancellationToken cancellationToken)
    {
        StringBuilder fileLinesFromStream = new();
        List<long> streamPositions = [];

        var serviceLogsFolder = Path.Combine(_rootLogsFolder, logFolder, "Logs");
        if (!Directory.Exists(serviceLogsFolder))
            return BadRequest(new { Message = $"Folder '{serviceLogsFolder}' does not exist!" });

        var logFilePath = new DirectoryInfo(serviceLogsFolder)
            .GetFiles("*.log", SearchOption.TopDirectoryOnly)
            .First().FullName;

        await using var stream = System.IO.File.OpenRead(logFilePath);
        var buffer = new byte[64];

        while (await stream.ReadAsync(buffer, cancellationToken) != 0)
        {
            streamPositions.Add(stream.Position);
            fileLinesFromStream.Append(Encoding.UTF8.GetString(buffer));
        }

        var parsedLines = _logsParser.Parse(fileLinesFromStream
                .ToString()
                .Trim()
                .Split(Environment.NewLine))
            .Select((log, i) => log with { FileIndex = i + 1 })
            .ToList();

        return Ok(new { FileLines = parsedLines, StreamPositions = streamPositions });
    }
}