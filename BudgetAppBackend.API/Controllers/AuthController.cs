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
        public async Task<IActionResult> Register([FromBody] AddUserDto addUserDto, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new RegisterUserCommand { AddUser = addUserDto }, cancellationToken);
            return CreatedAtAction(nameof(Register), new { userId = result.UserId }, result);
        }


        [HttpPost("login")]
        public async Task<ActionResult<AuthResult>> Login([FromBody] LogUserDto LogUserDto, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new LoginCommand { LogUser = LogUserDto }, cancellationToken);
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResult>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto, CancellationToken cancellationToken)
        {
            var authResult = await Sender.Send(new RefreshTokenCommand { RefreshToken = refreshTokenDto }, cancellationToken);
            return Ok(authResult);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto, CancellationToken cancellationToken)
        {
            await Sender.Send(new ResetPasswordCommand { resetPassword = resetPasswordDto }, cancellationToken);
            return NoContent();
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new VerifyEmailCommand { VerifyEmailDto = verifyEmailDto }, cancellationToken);
            return Ok(result); 
        }

        [HttpPost("send-verification-code")]
        public async Task<ActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto sendVerificationCodeDto, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new SendVerificationCodeCommand { SendVerificationCodeDto = sendVerificationCodeDto }, cancellationToken);
            return Ok(new { success = true, message = "Verification code sent successfully." });
        }
    }
}
