namespace AthleTrack.API.Models;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

public class WorkoutSet
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Workout")]
    public int? WorkoutId { get; set; }
    public Workout? Workout { get; set; }

    [ForeignKey("Exercise")]
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; }

    [Required]
    public int SetNumber { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? WeightKg { get; set; }
    public int? Reps { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? DistanceKm { get; set; }
    public int? TimeSeconds { get; set; }
}