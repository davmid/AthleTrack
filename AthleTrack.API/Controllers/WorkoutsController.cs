using AthleTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AthleTrack.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkoutsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        // GET: api/Workouts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Workout>>> GetWorkouts()
        {
            var userId = GetUserId();

            return await _context.Workouts
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.Date)
                .ToListAsync();
        }

        // POST: api/Workouts
        [HttpPost]
        public async Task<ActionResult<Workout>> PostWorkout(Workout workout)
        {
            var userId = GetUserId();
            workout.UserId = userId;

            workout.User = null;
            workout.WorkoutSets = null;

            _context.Workouts.Add(workout);

            try
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetWorkouts), new { id = workout.Id }, workout);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Błąd podczas zapisu treningu: {ex.Message}");
                return StatusCode(500, "Wystąpił błąd podczas zapisywania treningu w bazie danych.");
            }
        }

    [HttpGet("records")]
    public async Task<ActionResult<IEnumerable<PersonalRecordDto>>> GetPersonalRecords()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var records = await _context.Workouts
            .Where(w => w.UserId == userId && w.WeightKg != null)
            .GroupBy(w => w.Name)
            .Select(group => group
                .OrderByDescending(w => w.WeightKg)
                .ThenByDescending(w => w.Reps)
                .Select(w => new PersonalRecordDto
                {
                    ExerciseName = w.Name,
                    MaxWeight = (double)w.WeightKg!,
                    MaxReps = w.Reps ?? 0,
                    Date = w.Date
                })
                .FirstOrDefault()
            )
            .ToListAsync();

        return Ok(records);
    }

        // DELETE: api/Workouts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var userId = GetUserId();
            var workout = await _context.Workouts.FindAsync(id);

            if (workout == null) return NotFound();
            if (workout.UserId != userId) return Forbid();

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}