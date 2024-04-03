FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app

EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["LogViewer/LogViewer.csproj", "LogViewer/"]
RUN dotnet restore "LogViewer/LogViewer.csproj"

COPY LogViewer/. LogViewer/
WORKDIR "/src/LogViewer"
RUN dotnet build "LogViewer.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "LogViewer.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS="http://+:80;https://+:443"
ENTRYPOINT ["dotnet", "LogViewer.dll"]
