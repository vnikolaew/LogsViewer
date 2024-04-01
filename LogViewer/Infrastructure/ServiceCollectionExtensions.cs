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
}