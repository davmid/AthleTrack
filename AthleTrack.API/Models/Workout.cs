using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System;
using AthleTrack.API.Models;
using System.Text.Json.Serialization;

public class Workout
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }

    [JsonIgnore]
    public Users? User { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public string? Notes { get; set; }

     public List<WorkoutSet>? WorkoutSets { get; set; } = new List<WorkoutSet>();
}