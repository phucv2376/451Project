using Moq;
using FluentAssertions;
using BudgetAppBackend.API.Controllers;
using BudgetAppBackend.Application.Features.Authentication.Login;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Microsoft.AspNetCore.Http;
using BudgetAppBackend.Application.Features.Authentication.Registration;

namespace BudgetAppBackend.API.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<ISender> _mockSender;
        private readonly AuthController _controller;
        private readonly Mock<IResponseCookies> _mockCookies;

        public AuthControllerTests()
        {
            _mockSender = new Mock<ISender>();
            _mockCookies = new Mock<IResponseCookies>();

            var mockHttpContext = new Mock<HttpContext>();
            var mockResponse = new Mock<HttpResponse>();

            mockResponse.Setup(r => r.Cookies).Returns(_mockCookies.Object);
            mockHttpContext.Setup(ctx => ctx.Response).Returns(mockResponse.Object);

            _controller = new AuthController(_mockSender.Object)
            {
                ControllerContext = new ControllerContext { HttpContext = mockHttpContext.Object }
            };
        }

        [Fact]
        public async Task Login_WhenCalled_ReturnsOkObjectResult_WithAuthResult()
        {
            // Arrange
            var loginDto = new LogUserDto { Email = "Admin@example.com", Password = "Root@ssword123" };
            var authResult = new AuthResult
            {
                RefreshToken = "d53a5f64-91be-4b2e-a937-bc93ef45d8a1",

                Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            };


            _mockSender.Setup(s => s.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
                       .ReturnsAsync(authResult);

            // Act
            var result = await _controller.Login(loginDto, CancellationToken.None);

            // Assert
            result.Result.Should().NotBeNull();

            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult.StatusCode.Should().Be(200);
            okResult.Value.Should().BeEquivalentTo(authResult);

            // Verify that the cookie was set
            _mockCookies.Verify(c => c.Append(
                It.Is<string>(s => s == "RefreshToken"),
                It.Is<string>(s => s == authResult.RefreshToken),
                It.IsAny<CookieOptions>()),
                Times.Once);
        }

        [Fact]
        public async Task Register_WhenCalled_ReturnsCreatedAtActionResult()
        {
            // Arrange:
            var addUserDto = new AddUserDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "johndoe@example.com",
                Password = "SecurePass!123",
                Confirmpassword = "SecurePass!123"
            };

            var registerResponse = new AuthResult
            {
                UserId = Guid.NewGuid()

            };

            _mockSender.Setup(s => s.Send(It.IsAny<RegisterUserCommand>(), It.IsAny<CancellationToken>()))
                       .ReturnsAsync(registerResponse);

            // Act
            var result = await _controller.Register(addUserDto, CancellationToken.None);

            // Assert
            result.Should().BeOfType<CreatedAtActionResult>();

            var createdAtResult = result as CreatedAtActionResult;
            createdAtResult.StatusCode.Should().Be(201);
            createdAtResult.ActionName.Should().Be(nameof(AuthController.Register));
            createdAtResult.Value.Should().BeEquivalentTo(registerResponse);
        }


    }
}
