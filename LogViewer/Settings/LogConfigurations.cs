using LogViewer.Services.Parsing;

namespace LogViewer.Settings;

public sealed class LogConfigurations
{
    public string BaseFolder { get; set; } = default!;
    
    public string? BaseFormat { get; set; } = default;

    public Dictionary<string, LogConfiguration> Services { get; set; } = new();

    public string[] ServiceNames
        => Services.Keys.ToArray();

    public string? GetServiceLogBaseFolder(string serviceName)
        => Services.TryGetValue(serviceName, out var serviceConfig)
            ? Path.Combine(BaseFolder, serviceConfig.LogsFolder!)
            : default!;

    public DirectoryInfo? GetServiceLogBaseDirectoryInfo(string serviceName)
        => Services.TryGetValue(serviceName, out var serviceConfig)
            ? new DirectoryInfo(Path.Combine(BaseFolder, serviceConfig.LogsFolder!))
            : default!;
}