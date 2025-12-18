using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AthleTrack.API.Models
{
    public class PlanItem
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("TrainingPlan")]
        public int TrainingPlanId { get; set; }

        [JsonIgnore]
        public TrainingPlan? TrainingPlan { get; set; }

        [Required]
        [ForeignKey("Exercise")]
        public int ExerciseId { get; set; }

        public Exercise? Exercise { get; set; }

        [Required]
        public int Sets { get; set; }

        [Required]
        public int Repetitions { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? TargetWeightKg { get; set; }

        public int? TargetTimeSeconds { get; set; }
    }
}