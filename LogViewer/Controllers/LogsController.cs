using System.Text;
using LogViewer.Models;
using LogViewer.Services.Parsing;
using LogViewer.Settings;
using Microsoft.AspNetCore.Mvc;
using DirectoryInfo = System.IO.DirectoryInfo;

namespace LogViewer.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class LogsController : ControllerBase
{
    private readonly string _rootLogsFolder;

    private readonly ILogsParser<LogLine> _logsParser;

    private readonly LogConfigurations _logConfigurations;

    private const string RootLogsFolder = "logs";

    private const string LogsFolder = "Logs";

    private const string LogFileFilter = "*.log";

    private const char NormalizedPathDirSeparator = '/';

    public LogsController(IHostEnvironment environment, ILogsParser<LogLine> logsParser,
        LogConfigurations logConfigurations)
    {
        _logsParser = logsParser;
        _logConfigurations = logConfigurations;
        _rootLogsFolder = Path.Combine(environment.ContentRootPath, RootLogsFolder);
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
    public IActionResult GetServices()
    {
        var serviceNames = new DirectoryInfo(_rootLogsFolder)
            .GetDirectories("*")
            .Where(di => di.GetDirectories().Any(d => d.Name.Trim() == LogsFolder))
            .Select(di => di.Name.Trim())
            .ToList();

        return Ok(new { Services = serviceNames });
    }

    [HttpGet("{serviceName}/{logFile}")]
    public async Task<IActionResult> GetLogFile(string serviceName, string logFile)
    {
        var logFileInfo = new DirectoryInfo(
                Path.Combine(_rootLogsFolder, serviceName, LogsFolder))
            .GetFiles(LogFileFilter)
            .FirstOrDefault(fi => fi.Name == logFile);

        if (logFileInfo is null ||
            !_logConfigurations.Configurations.TryGetValue(serviceName, out LogConfiguration? logConfiguration))
            return BadRequest();

        return Ok(new
        {
            FileInfo = new LogFileInfo
            {
                LastWriteTime = logFileInfo.LastWriteTimeUtc,
                FileSize = logFileInfo.Length,
                FileName = logFileInfo.FullName.Replace(Path.DirectorySeparatorChar, NormalizedPathDirSeparator),
                FileRelativePath = Path.Combine(RootLogsFolder, serviceName, LogsFolder, logFileInfo.Name)
                    .Replace(Path.DirectorySeparatorChar, NormalizedPathDirSeparator)
            },
            Logs = _logsParser.Parse(
                Encoding.UTF8.GetString(await System.IO.File.ReadAllBytesAsync(logFileInfo.FullName))
                    .Trim()
                    .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries)
                , logConfiguration).ToList()
        });
    }

    [HttpGet("{serviceName}/files")]
    public async Task<IActionResult> GetLogFiles(
        string serviceName, [FromQuery] int offset, [FromQuery] int limit)
    {
        var allLogFiles = new DirectoryInfo(Path.Combine(_rootLogsFolder, serviceName, LogsFolder))
            .GetFiles(LogFileFilter);

        var serviceLogFiles = allLogFiles
            .OrderByDescending(fi => fi.LastWriteTimeUtc)
            .Skip(offset)
            .Take(limit)
            .Select(fi => new LogFileInfo
            {
                LastWriteTime = fi.LastWriteTimeUtc,
                FileSize = fi.Length,
                FileName = fi.Name,
                FileRelativePath = Path.Combine(RootLogsFolder, serviceName, LogsFolder, fi.Name)
                    .Replace(Path.DirectorySeparatorChar, NormalizedPathDirSeparator)
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
                FolderRelativePath = Path.Combine(LogsFolder, di.Name)
                    .Replace(Path.DirectorySeparatorChar, NormalizedPathDirSeparator),
                TotalLogFilesCount = di.GetDirectories(RootLogsFolder)[0].GetFiles(LogFileFilter).Length,
                LogFiles = di.GetDirectories(LogsFolder)[0]
                    .GetFiles(LogFileFilter)
                    .OrderByDescending(fi => fi.LastWriteTimeUtc)
                    .Take(10)
                    .Select(fi => new LogFileInfo
                    {
                        LastWriteTime = fi.LastWriteTimeUtc,
                        FileSize = fi.Length,
                        FileName = fi.Name,
                        FileRelativePath = Path.Combine(RootLogsFolder, di.Name, LogsFolder, fi.Name)
                            .Replace(Path.DirectorySeparatorChar, NormalizedPathDirSeparator),
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

        var serviceLogsFolder = Path.Combine(_rootLogsFolder, logFolder, LogsFolder);
        if (!Directory.Exists(serviceLogsFolder))
            return BadRequest(new { Message = $"Folder '{serviceLogsFolder}' does not exist!" });

        var logFilePath = new DirectoryInfo(serviceLogsFolder)
            .GetFiles(LogFileFilter, SearchOption.TopDirectoryOnly)
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
                .Split(Environment.NewLine), _logConfigurations.Configurations[logFolder])
            .Select((log, i) => log with { FileIndex = i + 1 })
            .ToList();

        return Ok(new { FileLines = parsedLines, StreamPositions = streamPositions });
    }
}