using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AthleTrack.API.Models;

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
            .Include(w => w.WorkoutSets)
                .ThenInclude(s => s.Exercise)
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

        if (workout.WorkoutSets != null)
        {
            foreach (var set in workout.WorkoutSets)
            {
                set.Exercise = null; 
            }
        }

        _context.Workouts.Add(workout);

        try
        {
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWorkouts), new { id = workout.Id }, workout);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd podczas zapisu: {ex.Message}");
            return StatusCode(500, "Błąd bazy danych.");
        }
    }

    [HttpGet("records")]
    public async Task<ActionResult<IEnumerable<PersonalRecordDto>>> GetPersonalRecords()
    {
        var userId = GetUserId();

        var records = await _context.WorkoutSets
            .Include(s => s.Exercise)
            .Include(s => s.Workout)
            .Where(s => s.Workout.UserId == userId)
            .GroupBy(s => s.Exercise.Name)
            .Select(g => new PersonalRecordDto
            {
                ExerciseName = g.Key,
                IsCardio = g.First().Exercise.IsCardio, 
                
                MaxWeight = (double)g.Max(s => s.WeightKg ?? 0),
                MaxReps = g.Max(s => s.Reps ?? 0),
                
                MaxDistanceKm = (double)g.Max(s => s.DistanceKm ?? 0),
                
                Date = g.OrderByDescending(s => s.WeightKg).ThenByDescending(s => s.DistanceKm).First().Workout.Date
            })
            .ToListAsync();

        return Ok(records);
    }

    // PUT: api/Workouts/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutWorkout(int id, Workout workout)
    {
        var userId = GetUserId();

        if (id != workout.Id) return BadRequest("ID mismatch");

        var existingWorkout = await _context.Workouts
            .Include(w => w.WorkoutSets)
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (existingWorkout == null) return NotFound();

        existingWorkout.Name = workout.Name;
        existingWorkout.Date = workout.Date;
        existingWorkout.Notes = workout.Notes;

        _context.WorkoutSets.RemoveRange(existingWorkout.WorkoutSets);

        if (workout.WorkoutSets != null)
        {
            foreach (var set in workout.WorkoutSets)
            {
                set.Id = 0;
                set.WorkoutId = id;
                set.Exercise = null;
                existingWorkout.WorkoutSets.Add(set);
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!WorkoutExists(id)) return NotFound();
            throw;
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Błąd podczas aktualizacji: {ex.Message}");
        }

        return NoContent();
    }

    private bool WorkoutExists(int id)
    {
        return _context.Workouts.Any(e => e.Id == id);
    }

    // DELETE: api/Workouts/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkout(int id)
    {
        var userId = GetUserId();
        var workout = await _context.Workouts
            .Include(w => w.WorkoutSets)
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (workout == null) return NotFound();

        _context.Workouts.Remove(workout);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}