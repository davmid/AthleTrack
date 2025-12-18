namespace AthleTrack.API.Models;

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class Exercise
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("User")]
    public int? UserId { get; set; }

    [JsonIgnore]
    public Users? User { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; }

    [Required]
    [MaxLength(100)]
    public string MuscleGroup { get; set; }

    public bool IsCardio { get; set; } = false;
}