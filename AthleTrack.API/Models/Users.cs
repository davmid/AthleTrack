namespace AthleTrack.API.Models;

using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System;

public class Users : IdentityUser<int>
{
    [MaxLength(100)]
    public string FirstName { get; set; }

    [MaxLength(100)]
    public string LastName { get; set; }

    public ICollection<Workout> Workouts { get; set; }
    public ICollection<BodyMetric> BodyMetrics { get; set; }

    public DateTime DateJoined { get; set; } = DateTime.UtcNow;
}