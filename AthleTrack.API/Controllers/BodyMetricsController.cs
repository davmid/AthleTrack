using AthleTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BodyMetricsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BodyMetricsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("last")]
    public async Task<IActionResult> GetLastMetric()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var lastMetric = await _context.BodyMetrics
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.MeasurementDate)
            .FirstOrDefaultAsync();

        if (lastMetric == null) return NotFound();
        return Ok(lastMetric);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMetrics()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var userId = int.Parse(userIdString);
        var metrics = await _context.BodyMetrics
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.MeasurementDate)
            .ToListAsync();

        return Ok(metrics);
    }

    [HttpPost]
    public async Task<IActionResult> AddMetric(BodyMetric metric)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        metric.UserId = userId;

        _context.BodyMetrics.Add(metric);
        await _context.SaveChangesAsync();

        return Ok(metric);
    }
}