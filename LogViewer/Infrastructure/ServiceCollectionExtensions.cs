using LogViewer.Settings;
using Microsoft.Extensions.Options;

namespace LogViewer.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddConfiguredCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var corsSettings = services.AddSettings<CorsSettings>(configuration, CorsSettings.SectionName);

        return services
            .AddCors(opts =>
                opts.AddDefaultPolicy(policy =>
                    policy
                        .WithOrigins(corsSettings.AllowedOrigins)
                        .AllowCredentials()
                        .AllowAnyHeader()
                        .AllowAnyMethod()));
    }

    public static TSettings AddSettings<TSettings>(
        this IServiceCollection services,
        IConfiguration configuration,
        string? sectionName = default) where TSettings : class, new()
    {
        var settings = new TSettings();
        configuration.GetSection(sectionName ?? typeof(TSettings).Name).Bind(settings);

        services.AddSingleton(settings);
        return settings;
    }

    public static IServiceCollection AddOptionsWithValidation<TOptions>(
        this IServiceCollection services,
        IConfiguration configuration,
        string? sectionName = default,
        Func<TOptions, object>? bindProperty = default,
        Action<TOptions>? configure = default) where TOptions : class
    {
        services
            .AddOptions<TOptions>()
            .Configure(opts =>
            {
                configuration.GetSection(sectionName ?? typeof(TOptions).Name).Bind(bindProperty?.Invoke(opts) ?? opts);
                configure?.Invoke(opts);
            })
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<TOptions>(sp =>
            sp.GetRequiredService<IOptions<TOptions>>().Value);
        return services;
    }

    public static IServiceCollection AddLogConfigurations(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
        => services
            .AddOptionsWithValidation<LogConfigurations>(
                configuration,
                bindProperty: c => c,
                configure: c =>
                {
                    c.BaseFolder = c
                        .BaseFolder
                        .Replace("{AppRoot}", environment.ContentRootPath);
                });
}