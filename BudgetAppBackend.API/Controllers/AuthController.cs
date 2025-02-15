using System.ComponentModel.DataAnnotations;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Features.Authentication.Login;
using BudgetAppBackend.Application.Features.Authentication.RefToken;
using BudgetAppBackend.Application.Features.Authentication.Registration;
using BudgetAppBackend.Application.Features.Authentication.ResetPassword;
using BudgetAppBackend.Application.Features.Authentication.SendVerificationCode;
using BudgetAppBackend.Application.Features.Authentication.VerifyEmail;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

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
            try
            {
                var newUser = await Sender.Send(new RegisterUserCommand { AddUser = AddUserDto }, cancellationToken);

                return Ok(newUser);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, errors = ex.Message.Split(", ") });
            }
            catch (ArgumentException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "An error occurred during registration." });
            }

        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResult>> Login([FromBody] LogUserDto LogUserDto)
        {
            try
            {
                var result = await Sender.Send(new LoginCommand { LogUser = LogUserDto });
                return Ok(result);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, errors = new List<string> { ex.Message } });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Success = false, Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, errors = new List<string> { "An error occurred while processing your request." } });
            }

        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResult>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var authResult = await Sender.Send(new RefreshTokenCommand { RefreshToken = refreshTokenDto });
                return Ok(authResult);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Success = false, Message = ex.Message });
            }
            catch (SecurityTokenExpiredException ex)
            {
                return StatusCode(440, new { Success = false, Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Success = false, Message = ex.Message });
            }
            catch (Exception)
            {
                return BadRequest(new { Success = false, Message = "An error occurred." });
            }

        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                await Sender.Send(new ResetPasswordCommand { resetPassword = resetPasswordDto });
                return NoContent();
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, errors = ex.Message.Split(", ") });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while resetting the password." });
            }
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            try
            {
                var result = await Sender.Send(new VerifyEmailCommand { VerifyEmailDto = verifyEmailDto });
                return Ok(result);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, errors = ex.Message.Split(", ") });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while verifying the email." });
            }
        }

        [HttpPost("send-verification-code")]
        public async Task<ActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto sendVerificationCodeDto)
        {
            try
            {
                var result = await Sender.Send(new SendVerificationCodeCommand { SendVerificationCodeDto = sendVerificationCodeDto });
                return Ok(new { success = true, message = "Verification code sent successfully." });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, errors = ex.Message.Split(", ") });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while sending verification code." });
            }
        }
    }
}
