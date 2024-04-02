using System.Text.RegularExpressions;
using LogViewer.Models;
using LogLevel = LogViewer.Models.LogLevel;

namespace LogViewer.Services.Parsing;

internal sealed partial class SsiLogsParser : LogsParserBase<LogLine>
{
    public override IEnumerable<LogLine> Parse(IEnumerable<string> logLines, ILogConfiguration logConfiguration)
    {
        foreach (var logLine in logLines)
        {
            if (TryParse(logLine, logConfiguration, out var log))
            {
                yield return log!;
            }
        }
    }

    public override bool TryParse(string logLine, ILogConfiguration logConfiguration, out LogLine? log)
    {
        log = default;

        var logFormat = logConfiguration.LogFormat;
        var regex = PatternRegex();

        Dictionary<string, string> nameToTypes = new();
        var resultRegex = regex.Replace(logFormat, match =>
        {
            var type = match.Groups["type"].Value;
            var name = match.Groups["name"].Value;
            nameToTypes[name] = type;

            return $"(?<{name}>{RegexFormats[type]})";
        });

        var logRegex = new Regex(resultRegex);
        var match = logRegex.Match(logLine);

        if (match.Success)
        {
            Dictionary<string, object> parsedValues = new();
            foreach (Group matchGroup in match.Groups.OfType<Group>().Where(_ => _ is not Match))
            {
                var parser = Parsers.GetValueOrDefault(nameToTypes[matchGroup.Name]);
                var parsedValue = parser!(matchGroup.Value);

                parsedValues[matchGroup.Name] = parsedValue;
            }

            log = new LogLine(
                default,
                ((DateOnly)parsedValues["date"]).ToDateTime((TimeOnly)parsedValues["time"]),
                (int)parsedValues["process_id"],
                (int)parsedValues["thread_id"],
                (LogLevel)parsedValues["log_level"],
                (string)parsedValues["content"],
                logLine.Trim());
            return true;
        }

        return false;
    }

    public override LogLine? ToLog(string logLine)
        => TryParse(logLine, null!, out var log) ? log : default;


    [GeneratedRegex(@"\{(?<name>[a-zA-Z_]+):(?<type>[a-zA-Z_]+)\}")]
    private static partial Regex PatternRegex();
}