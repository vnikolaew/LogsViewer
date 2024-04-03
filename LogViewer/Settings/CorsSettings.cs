namespace LogViewer.Settings;

public sealed class CorsSettings
{
    public const string SectionName = "Cors";
    
    public string[] AllowedOrigins { get; set; } = [];
}