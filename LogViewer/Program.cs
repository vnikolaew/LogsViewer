using System.Text.Json.Serialization;
using LogViewer.Hubs;
using LogViewer.Infrastructure;
using LogViewer.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddHostedService<LogsNotifier>()
    .AddEndpointsApiExplorer()
    .AddConfiguredCors()
    .AddSwaggerGen()
    .AddSingleton<ILogsParser, LogsParser>()
    .AddControllers();

builder.Services.Configure<JsonOptions>(opts =>
    opts.JsonSerializerOptions.Converters.Insert(0, new JsonStringEnumConverter()));

builder.Services.AddSignalR().AddJsonProtocol(opts =>
{
    opts.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app
        .UseSwagger()
        .UseSwaggerUI();
}

app.UseHttpsRedirection()
    .UseCors();

string[] summaries =
[
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
];

app.MapDefaultControllerRoute();
app.MapHub<LogsHub>(LogsHub.Endpoint);
app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast")
    .WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}