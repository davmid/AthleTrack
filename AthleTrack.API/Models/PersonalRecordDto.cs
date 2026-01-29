using System;

namespace AthleTrack.API.Models
{
    public class PersonalRecordDto
    {
        public string ExerciseName { get; set; }

        public double MaxWeight { get; set; }

        public int MaxReps { get; set; }

        public double? MaxDistanceKm { get; set; }

        public DateTime Date { get; set; }

        public bool IsCardio { get; set; }
        
        public double? EstimatedOneRepMax => MaxWeight > 0 
            ? Math.Round(MaxWeight * (1 + 0.0333 * MaxReps), 1) 
            : null;
    }
}