using System.IO;
using System.Windows;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Cronia.Application;
using Cronia.Infrastructure;
using Cronia.Presentation.ViewModels;
using Cronia.Presentation.Views;

namespace Cronia.Presentation;

public partial class App : System.Windows.Application
{
    private readonly IHost _host;

    public App()
    {
        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string appFolder = Path.Combine(localAppData, "Cronia");
        Directory.CreateDirectory(appFolder);

        string logPath = Path.Combine(appFolder, "logs", "cronia-.log");
        string dbPath = Path.Combine(appFolder, "cronia.db");

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Debug()
            .WriteTo.File(logPath, rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7)
            .CreateLogger();

        Log.Information("Starting Cronia application host builder...");

        _host = Host.CreateDefaultBuilder()
            .UseSerilog()
            .ConfigureServices((context, services) =>
            {
                // Clean Architecture Layer Services
                services.AddApplication();
                services.AddInfrastructure(dbPath);

                // Presentation Layer
                services.AddSingleton<MainViewModel>();
                services.AddSingleton<MainWindow>();
            })
            .Build();
    }

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        try
        {
            await _host.StartAsync();
            Log.Information("Application host started successfully.");

            var mainWindow = _host.Services.GetRequiredService<MainWindow>();
            mainWindow.Show();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Critical failure during application startup.");
            System.Windows.MessageBox.Show($"Error fatal al iniciar la aplicación:\n{ex.Message}", "Cronia - Error Fatal", MessageBoxButton.OK, MessageBoxImage.Error);
            Shutdown(1);
        }
    }

    protected override async void OnExit(ExitEventArgs e)
    {
        Log.Information("Shutting down application host...");
        using (_host)
        {
            await _host.StopAsync(TimeSpan.FromSeconds(5));
        }
        Log.CloseAndFlush();
        base.OnExit(e);
    }
}
