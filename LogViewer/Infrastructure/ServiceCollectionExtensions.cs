using LogViewer.Services.Parsing;
using LogViewer.Settings;
using Microsoft.Extensions.Options;

namespace LogViewer.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddConfiguredCors(this IServiceCollection services)
        => services
            .AddCors(opts =>
                opts.AddDefaultPolicy(policy =>
                    policy
                        .WithOrigins(
                            "http://localhost:3000",
                            "http://localhost:3000/"
                        )
                        .AllowCredentials()
                        .AllowAnyHeader()
                        .AllowAnyMethod()));

    public static IServiceCollection AddOptionsWithValidation<TOptions>(
        this IServiceCollection services,
        IConfiguration configuration) where TOptions : class
    {
        services
            .AddOptions<TOptions>()
            .Configure(opts => { configuration.GetSection(typeof(TOptions).Name).Bind(opts); })
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<TOptions>(sp =>
            sp.GetRequiredService<IOptions<TOptions>>().Value);
        return services;
    }

    public static IServiceCollection AddLogConfigurations(
        this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddOptions<LogConfigurations>()
            .Configure(opts => { configuration.GetSection(nameof(LogConfigurations)).Bind(opts.Configurations); })
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<LogConfigurations>(sp =>
            sp.GetRequiredService<IOptions<LogConfigurations>>().Value);
        return services;
    }
}