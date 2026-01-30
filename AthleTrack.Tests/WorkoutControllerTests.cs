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
    public class WorkoutsControllerTests
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
        public async Task Post_workout_should_save_workout_and_return_created_at()
        {
            var context = GetDatabaseContext();
            var controller = new WorkoutsController(context);
            SetupUserContext(controller, 1);

            var workout = new Workout
            {
                Name = "Trening Siłowy",
                Date = DateTime.Now,
                WorkoutSets = new List<WorkoutSet>
                {
                    new WorkoutSet { ExerciseId = 1, Reps = 10, WeightKg = 80 }
                }
            };

            var result = await controller.PostWorkout(workout);

            result.Result.Should().BeOfType<CreatedAtActionResult>();
            context.Workouts.Should().HaveCount(1);
        }

        [Fact]
        public async Task Get_personal_records_should_calculate_correct_max_values()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            
            var exercise = new Exercise { Id = 1, Name = "Przysiad", MuscleGroup = "Nogi", IsCardio = false };
            context.Exercises.Add(exercise);

            var workout = new Workout { Id = 1, UserId = userId, Name = "Trening Testowy", Date = DateTime.Now };
            context.Workouts.Add(workout);

            context.WorkoutSets.AddRange(new List<WorkoutSet>
            {
                new WorkoutSet { WorkoutId = 1, ExerciseId = 1, WeightKg = 100, Reps = 5 },
                new WorkoutSet { WorkoutId = 1, ExerciseId = 1, WeightKg = 120, Reps = 3 },
                new WorkoutSet { WorkoutId = 1, ExerciseId = 1, WeightKg = 110, Reps = 8 }
            });
            await context.SaveChangesAsync();

            var controller = new WorkoutsController(context);
            SetupUserContext(controller, userId);

            var result = await controller.GetPersonalRecords();

            var okResult = result.Result as OkObjectResult;
            var records = okResult!.Value as IEnumerable<PersonalRecordDto>;
            
            var squatRecord = records!.First(r => r.ExerciseName == "Przysiad");
            squatRecord.MaxWeight.Should().Be(120);
            squatRecord.MaxReps.Should().Be(8);
        }

        [Fact]
        public async Task Put_workout_should_update_fields_and_replace_sets()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            var workout = new Workout 
            { 
                Id = 1, 
                UserId = userId, 
                Name = "Stara Nazwa",
                Date = DateTime.Now,
                WorkoutSets = new List<WorkoutSet> { new WorkoutSet { Id = 1, Reps = 5 } }
            };
            context.Workouts.Add(workout);
            await context.SaveChangesAsync();

            var controller = new WorkoutsController(context);
            SetupUserContext(controller, userId);

            var updatedWorkout = new Workout
            {
                Id = 1,
                Name = "Nowa Nazwa",
                Date = DateTime.Now,
                WorkoutSets = new List<WorkoutSet> { new WorkoutSet { Reps = 12 } }
            };

            var result = await controller.PutWorkout(1, updatedWorkout);

            result.Should().BeOfType<NoContentResult>();
            var dbWorkout = await context.Workouts.Include(w => w.WorkoutSets).FirstAsync();
            dbWorkout.Name.Should().Be("Nowa Nazwa");
        }

        [Fact]
        public async Task Delete_workout_should_remove_workout_from_db()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            context.Workouts.Add(new Workout { Id = 1, UserId = userId, Name = "Do usunięcia", Date = DateTime.Now });
            await context.SaveChangesAsync();

            var controller = new WorkoutsController(context);
            SetupUserContext(controller, userId);

            var result = await controller.DeleteWorkout(1);

            result.Should().BeOfType<NoContentResult>();
            context.Workouts.Should().BeEmpty();
        }
    }
}