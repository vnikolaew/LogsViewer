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
        IConfiguration configuration,
        Func<TOptions, object>? bindProperty = default) where TOptions : class
    {
        services
            .AddOptions<TOptions>()
            .Configure(opts =>
            {
                configuration.GetSection(typeof(TOptions).Name).Bind(bindProperty?.Invoke(opts) ?? opts);
            })
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<TOptions>(sp =>
            sp.GetRequiredService<IOptions<TOptions>>().Value);
        return services;
    }

    public static IServiceCollection AddLogConfigurations(
        this IServiceCollection services, IConfiguration configuration)
        => services
            .AddOptionsWithValidation<LogConfigurations>(
                configuration, c => c.Configurations);
}