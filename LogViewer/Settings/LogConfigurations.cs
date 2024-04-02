using LogViewer.Services.Parsing;

namespace LogViewer.Settings;

public sealed class LogConfigurations
{
    public Dictionary<string, LogConfiguration> Configurations { get; set; } = new();
}