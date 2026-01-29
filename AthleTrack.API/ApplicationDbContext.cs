using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AthleTrack.API.Models;
using System.Reflection.Emit;

public class ApplicationDbContext
    : IdentityDbContext<Users, IdentityRole<int>, int>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options
    ) : base(options)
    {
    }

    public DbSet<Workout> Workouts { get; set; }
    public DbSet<WorkoutSet> WorkoutSets { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<BodyMetric> BodyMetrics { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Exercise>().HasData(
        new Exercise { Id = 1, Name = "Wyciskanie na ławce", MuscleGroup = "Klatka", UserId = null, IsCardio = false },
        new Exercise { Id = 2, Name = "Przysiad ze sztangą", MuscleGroup = "Nogi", UserId = null, IsCardio = false },
        new Exercise { Id = 3, Name = "Martwy ciąg", MuscleGroup = "Plecy", UserId = null, IsCardio = false },
        new Exercise { Id = 4, Name = "Bieg na bieżni", MuscleGroup = "Cardio", UserId = null, IsCardio = true },
        new Exercise { Id = 5, Name = "Uginanie ramion ze sztangą", MuscleGroup = "Biceps", UserId = null, IsCardio = false }
    );
    }
}
