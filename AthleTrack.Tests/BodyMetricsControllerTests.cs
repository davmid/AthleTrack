using AthleTrack.API.Controllers;
using AthleTrack.API.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace AthleTrack.Tests
{
    public class BodyMetricsControllerTests
    {
        private ApplicationDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            return new ApplicationDbContext(options);
        }

        private void SetupUserContext(ControllerBase controller, int userId)
        {
            var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        [Fact]
        public async Task Get_last_metric_should_return_most_recent_measurement()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            
            context.BodyMetrics.AddRange(new List<BodyMetric>
            {
                new BodyMetric { UserId = userId, WeightKg = 80, MeasurementDate = DateTime.Now.AddDays(-10) },
                new BodyMetric { UserId = userId, WeightKg = 78, MeasurementDate = DateTime.Now }
            });
            await context.SaveChangesAsync();

            var controller = new BodyMetricsController(context);
            SetupUserContext(controller, userId);

            var result = await controller.GetLastMetric();

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            var metric = okResult!.Value as BodyMetric;
            metric!.WeightKg.Should().Be(78);
        }

        [Fact]
        public async Task Add_metric_should_assign_user_id_and_save_to_database()
        {
            var context = GetDatabaseContext();
            var userId = 99;
            var controller = new BodyMetricsController(context);
            SetupUserContext(controller, userId);

            var newMetric = new BodyMetric { WeightKg = 90, MeasurementDate = DateTime.Now };

            var result = await controller.AddMetric(newMetric);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            
            var dbMetric = await context.BodyMetrics.FirstOrDefaultAsync(m => m.WeightKg == 90);
            dbMetric.Should().NotBeNull();
            dbMetric!.UserId.Should().Be(userId);
        }

        [Fact]
        public async Task Get_all_metrics_should_only_return_metrics_of_logged_user()
        {
            var context = GetDatabaseContext();
            context.BodyMetrics.AddRange(new List<BodyMetric>
            {
                new BodyMetric { UserId = 1, WeightKg = 70 },
                new BodyMetric { UserId = 1, WeightKg = 71 },
                new BodyMetric { UserId = 2, WeightKg = 100 }
            });
            await context.SaveChangesAsync();

            var controller = new BodyMetricsController(context);
            SetupUserContext(controller, 1);

            var result = await controller.GetAllMetrics();

            var okResult = result as OkObjectResult;
            var metrics = okResult!.Value as List<BodyMetric>;
            metrics.Should().HaveCount(2);
            metrics.Should().NotContain(m => m.WeightKg == 100);
        }
    }
}