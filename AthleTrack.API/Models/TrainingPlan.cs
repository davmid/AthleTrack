using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AthleTrack.API.Models
{
    public class TrainingPlan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [JsonIgnore] // Zapobiega zapętleniu: nie wysyłamy pełnych danych usera w obiekcie planu
        public Users? User { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public ICollection<PlanItem> PlanItems { get; set; } = new List<PlanItem>();
    }
}