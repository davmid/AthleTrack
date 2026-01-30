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
    public class ExercisesControllerTests
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
        public async Task Get_exercises_should_return_global_and_user_specific_exercises()
        {
            var context = GetDatabaseContext();
            var myUserId = 1;

            context.Exercises.AddRange(new List<Exercise>
            {
                new Exercise { Id = 1, Name = "Pompki", MuscleGroup = "Klatka", UserId = null },
                new Exercise { Id = 2, Name = "Moje Prywatne", MuscleGroup = "Plecy", UserId = myUserId },
                new Exercise { Id = 3, Name = "Ćwiczenie Innego", MuscleGroup = "Nogi", UserId = 2 }
            });
            await context.SaveChangesAsync();

            var controller = new ExercisesController(context);
            SetupUserContext(controller, myUserId);

            var result = await controller.GetExercises();
            var exercises = result.Value as IEnumerable<Exercise>;
            
            exercises.Should().HaveCount(2);
            exercises.Should().Contain(e => e.Name == "Pompki");
            exercises.Should().NotContain(e => e.Name == "Ćwiczenie Innego");
        }

        [Fact]
        public async Task Post_exercise_should_return_bad_request_when_duplicate_name_for_user()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            context.Exercises.Add(new Exercise { Name = "Biceps Curl", MuscleGroup = "Biceps", UserId = userId });
            await context.SaveChangesAsync();

            var controller = new ExercisesController(context);
            SetupUserContext(controller, userId);
            var duplicate = new Exercise { Name = "biceps curl", MuscleGroup = "Biceps" };

            var result = await controller.PostExercise(duplicate);

            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Delete_exercise_should_return_forbid_when_trying_to_delete_system_exercise()
        {
            var context = GetDatabaseContext();
            context.Exercises.Add(new Exercise { Id = 10, Name = "Przysiad", MuscleGroup = "Nogi", UserId = null });
            await context.SaveChangesAsync();

            var controller = new ExercisesController(context);
            SetupUserContext(controller, 1);

            var result = await controller.DeleteExercise(10);

            result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task Delete_exercise_should_return_no_content_when_owner_deletes_own_exercise()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            context.Exercises.Add(new Exercise { Id = 5, Name = "Do usunięcia", MuscleGroup = "Inne", UserId = userId });
            await context.SaveChangesAsync();

            var controller = new ExercisesController(context);
            SetupUserContext(controller, userId);

            var result = await controller.DeleteExercise(5);

            result.Should().BeOfType<NoContentResult>();
            context.Exercises.Any(e => e.Id == 5).Should().BeFalse();
        }

        [Fact]
        public async Task Post_exercise_should_trim_name_before_saving()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            var controller = new ExercisesController(context);
            SetupUserContext(controller, userId);
            
            var newExercise = new Exercise 
            { 
                Name = "   Bench Press   ",
                MuscleGroup = "Chest" 
            };

            var result = await controller.PostExercise(newExercise);

            var okResult = result.Result as OkObjectResult;
            var savedExercise = okResult!.Value as Exercise;
            savedExercise!.Name.Should().Be("Bench Press");
        }

        [Fact]
        public async Task Get_exercises_should_return_exercises_sorted_alphabetically()
        {
            var context = GetDatabaseContext();
            var userId = 1;
            context.Exercises.AddRange(new List<Exercise>
            {
                new Exercise { Name = "Z-Press", MuscleGroup = "Shoulders", UserId = userId },
                new Exercise { Name = "Arnold Press", MuscleGroup = "Shoulders", UserId = userId },
                new Exercise { Name = "Bench Press", MuscleGroup = "Chest", UserId = userId }
            });
            await context.SaveChangesAsync();

            var controller = new ExercisesController(context);
            SetupUserContext(controller, userId);

            var result = await controller.GetExercises();
            var exercises = (result.Value as IEnumerable<Exercise>)!.ToList();

            exercises[0].Name.Should().Be("Arnold Press");
            exercises[1].Name.Should().Be("Bench Press");
            exercises[2].Name.Should().Be("Z-Press");
        }
    }
}