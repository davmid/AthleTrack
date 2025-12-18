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
    public class ExercisesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExercisesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        // GET: api/Exercises
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Exercise>>> GetExercises()
        {
            var userId = GetUserId();

            return await _context.Exercises
                .Where(e => e.UserId == userId || e.UserId == null)
                .OrderBy(e => e.Name)
                .ToListAsync();
        }

        // POST: api/Exercises
        [HttpPost]
        public async Task<ActionResult<Exercise>> PostExercise(Exercise exercise)
        {
            var userId = GetUserId();

            if (string.IsNullOrWhiteSpace(exercise.Name))
                return BadRequest("Nazwa ćwiczenia nie może być pusta.");

            exercise.Name = exercise.Name.Trim();

            bool exists = await _context.Exercises
                .AnyAsync(e => e.UserId == userId && e.Name.ToLower() == exercise.Name.ToLower());

            if (exists)
            {
                return BadRequest("Ćwiczenie o tej nazwie już istnieje w Twojej bibliotece.");
            }

            exercise.UserId = userId;

            exercise.User = null;

            _context.Exercises.Add(exercise);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(exercise);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Błąd podczas zapisu ćwiczenia: {ex.Message}");
                return StatusCode(500, "Błąd serwera podczas zapisywania ćwiczenia.");
            }
        }

        // DELETE: api/Exercises/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExercise(int id)
        {
            var userId = GetUserId();
            var exercise = await _context.Exercises.FindAsync(id);

            if (exercise == null) return NotFound();

            if (exercise.UserId != userId)
            {
                return Forbid("Nie możesz usuwać ćwiczeń systemowych lub należących do innych użytkowników.");
            }

            _context.Exercises.Remove(exercise);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}