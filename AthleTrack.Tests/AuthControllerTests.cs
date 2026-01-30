using AthleTrack.API.Controllers;
using AthleTrack.API.Models.Auth;
using AthleTrack.API.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Http;

namespace AthleTrack.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<Users>> _mockUserManager;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            var store = new Mock<IUserStore<Users>>();
            _mockUserManager = new Mock<UserManager<Users>>(
                store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
            
            _mockConfiguration = new Mock<IConfiguration>();
            _controller = new AuthController(_mockUserManager.Object, _mockConfiguration.Object);
        }

        [Fact]
        public async Task Register_should_return_ok_when_user_is_created()
        {
            var model = new RegistrationDto 
            { 
                Email = "test@test.com", 
                Password = "Password123!", 
                FirstName = "Jan", 
                LastName = "Kowalski" 
            };

            _mockUserManager.Setup(x => x.FindByEmailAsync(model.Email))
                .ReturnsAsync((Users)null);

            _mockUserManager.Setup(x => x.CreateAsync(It.IsAny<Users>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);

            var result = await _controller.Register(model);

            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task Register_should_return_error_when_user_already_exists()
        {
            var model = new RegistrationDto { Email = "exists@test.com" };
            
            _mockUserManager.Setup(x => x.FindByEmailAsync(model.Email))
                .ReturnsAsync(new Users { Email = model.Email });

            var result = await _controller.Register(model);

            var statusCodeResult = result as ObjectResult;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.Should().Be("User already exists.");
        }

        [Fact]
        public async Task Login_should_return_unauthorized_when_credentials_are_invalid()
        {
            var model = new LoginDto { Email = "wrong@test.com", Password = "wrongpassword" };

            _mockUserManager.Setup(x => x.FindByEmailAsync(model.Email))
                .ReturnsAsync((Users)null);

            var result = await _controller.Login(model);
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }
    }
}