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

    [HttpGet("tree")]
    public async Task<IActionResult> GetLogsTree()
    {
        var serviceLogTrees = new DirectoryInfo(_rootLogsFolder)
            .GetDirectories()
            .Select(di => new ServiceLogTree
            {
                ServiceName = di.Name.Trim(),
                FolderRelativePath = Path.Combine("logs", di.Name).Replace(Path.DirectorySeparatorChar, '/'),
                LogFiles = di.GetDirectories("Logs")[0]
                    .GetFiles("*.log")
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