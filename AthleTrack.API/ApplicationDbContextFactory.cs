using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using System;
using System.Reflection;
using AthleTrack.API;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        string basePath;

        basePath = AppContext.BaseDirectory;

        if (!File.Exists(Path.Combine(basePath, "appsettings.json")))
        {
            basePath = Directory.GetCurrentDirectory();
        }

        if (!File.Exists(Path.Combine(basePath, "appsettings.json")))
        {
            var solutionDir = Directory.GetParent(Directory.GetCurrentDirectory());
            if (solutionDir != null)
            {
                basePath = Path.Combine(solutionDir.FullName, "AthleTrack.API");
            }
        }

        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException($"Nie znaleziono ciągu połączenia 'DefaultConnection'. Sprawdzana ścieżka bazowa: {basePath}");
        }

        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        builder.UseNpgsql(connectionString);

        return new ApplicationDbContext(builder.Options);
    }
}