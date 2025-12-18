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
    public class TrainingPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TrainingPlansController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        // GET: api/TrainingPlans
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TrainingPlan>>> GetPlans()
        {
            var userId = GetUserId();

            // Pobieramy plany, ich elementy oraz dane o samym ćwiczeniu (np. Name)
            return await _context.TrainingPlans
                .Where(p => p.UserId == userId)
                .Include(p => p.PlanItems)
                    .ThenInclude(i => i.Exercise)
                .ToListAsync();
        }

        // POST: api/TrainingPlans
        [HttpPost]
        public async Task<ActionResult<TrainingPlan>> PostPlan(TrainingPlan plan)
        {
            var userId = GetUserId();
            plan.UserId = userId;

            // Czyścimy właściwości nawigacyjne, aby EF skupił się na kluczach obcych
            plan.User = null;

            if (plan.PlanItems != null)
            {
                foreach (var item in plan.PlanItems)
                {
                    // Upewniamy się, że EF nie próbuje stworzyć ćwiczenia na nowo
                    item.Exercise = null;
                }
            }

            _context.TrainingPlans.Add(plan);

            try
            {
                await _context.SaveChangesAsync();

                // Zwracamy plan wraz z załadowanymi danymi, aby frontend od razu mógł go wyświetlić
                var createdPlan = await _context.TrainingPlans
                    .Include(p => p.PlanItems)
                        .ThenInclude(i => i.Exercise)
                    .FirstOrDefaultAsync(p => p.Id == plan.Id);

                return Ok(createdPlan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Błąd zapisu planu: {ex.Message}");
            }
        }

        // DELETE: api/TrainingPlans/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(int id)
        {
            var userId = GetUserId();
            var plan = await _context.TrainingPlans.FindAsync(id);

            if (plan == null) return NotFound();
            if (plan.UserId != userId) return Forbid();

            _context.TrainingPlans.Remove(plan);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}