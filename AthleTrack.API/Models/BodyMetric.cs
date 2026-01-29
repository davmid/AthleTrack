using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Text.Json.Serialization;

namespace AthleTrack.API.Models
{
    public class BodyMetric
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [JsonIgnore]
        public Users? User { get; set; }

        [Required]
        public DateTime MeasurementDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WeightKg { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BodyFatPercent { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WaistCm { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? ChestCm { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BicepsCm { get; set; }
    }
}