using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Features.Authentication.Login;
using BudgetAppBackend.Application.Features.Authentication.RefToken;
using BudgetAppBackend.Application.Features.Authentication.Registration;
using BudgetAppBackend.Application.Features.Authentication.ResetPassword;
using BudgetAppBackend.Application.Features.Authentication.SendVerificationCode;
using BudgetAppBackend.Application.Features.Authentication.VerifyEmail;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BudgetAppBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ISender Sender;

        public AuthController(ISender sender)
        {
            Sender = sender;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResult>> Register([FromBody] AddUserDto AddUserDto, CancellationToken cancellationToken)
        {
            var newUser = await Sender.Send(new RegisterUserCommand { AddUser = AddUserDto }, cancellationToken);

            return Ok(newUser);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResult>> Login([FromBody] LogUserDto LogUserDto)
        {
            var result = await Sender.Send(new LoginCommand { LogUser = LogUserDto });

            if (!result.Success)
            {
                return BadRequest(new { success = false, errors = new List<string> { result.Message ?? "Login failed." } });
            }

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResult>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            var authResult = await Sender.Send(new RefreshTokenCommand { RefreshToken = refreshTokenDto });
            return Ok(authResult);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            await Sender.Send(new ResetPasswordCommand { resetPassword = resetPasswordDto });
            return NoContent();
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            var result = await Sender.Send(new VerifyEmailCommand { VerifyEmailDto = verifyEmailDto });
            if (!result.Success)
            {
                return BadRequest(new { success = false, errors = new List<string> { result.Message ?? "Verification failed." } });
            }
            return Ok(result);
        }

        [HttpPost("send-verification-code")]
        public async Task<ActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto sendVerificationCodeDto)
        {
            var result = await Sender.Send(new SendVerificationCodeCommand { SendVerificationCodeDto = sendVerificationCodeDto });
            return result ? Ok() : BadRequest(new {success = false, errors = new List<string> { "Failed to send verification code" } });
        }
    }
}
