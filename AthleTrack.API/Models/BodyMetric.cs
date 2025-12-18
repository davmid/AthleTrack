using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace AthleTrack.API.Models
{
    public class BodyMetric
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public Users User { get; set; }

        [Required]
        public DateTime MeasurementDate { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? WeightKg { get; set; }

        [Column(TypeName = "decimal(4, 2)")]
        public decimal? BodyFatPercent { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? WaistCm { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? ChestCm { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? BicepsCm { get; set; }

        public string Notes { get; set; }
    }
}