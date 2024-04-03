using System.Text.Json.Serialization;
using LogViewer.Hubs;
using LogViewer.Infrastructure;
using LogViewer.Models;
using LogViewer.Services;
using LogViewer.Services.Parsing;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Services
        .AddHostedService<LogsNotifier>()
        .AddEndpointsApiExplorer()
        .AddConfiguredCors(builder.Configuration)
        .AddLogConfigurations(builder.Configuration, builder.Environment)
        .AddSwaggerGen()
        .AddSingleton<ILogsParser<LogLine>, SsiLogsParser>()
        .AddControllers();

    builder.Services.Configure<JsonOptions>(opts =>
        opts.JsonSerializerOptions.Converters.Insert(0, new JsonStringEnumConverter()));

    builder.Services
        .AddSignalR()
        .AddJsonProtocol(opts =>
            opts.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
}

var app = builder.Build();
{
// Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app
            .UseSwagger()
            .UseSwaggerUI();
    }

    app
        .UsePathBase(string.Empty)
        .UseHttpsRedirection()
        .UseCors()
        .UseRouting();
    app.MapDefaultControllerRoute();
    app.MapHub<LogsHub>(LogsHub.Endpoint);
    app.Run();
}