using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Features.Authentication.Login;
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
    public class UserController : ControllerBase
    {
        public readonly ISender Sender;

        public UserController(ISender sender)
        {
            Sender = sender;
        }

        [HttpPost("Register")]
        public async Task<ActionResult<AuthResult>> Register([FromBody] AddUserDto AddUserDto, CancellationToken cancellationToken)
        {
            var newUser = await Sender.Send(new RegisterUserCommand { AddUser = AddUserDto }, cancellationToken);

            return Ok(newUser);
        }

        [HttpPost("Login")]
        public async Task<ActionResult<AuthResult>> Login([FromBody] LogUserDto LogUserDto)
        {
            var newUser = await Sender.Send(new LoginCommand { LogUser = LogUserDto });

            return Ok(newUser);
        }

        [HttpPost("ResetPassword")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            await Sender.Send(new ResetPasswordCommand { resetPassword = resetPasswordDto });
            return NoContent();
        }

        [HttpPost("VerifyEmail")]
        public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            var result = await Sender.Send(new VerifyEmailCommand { VerifyEmailDto = verifyEmailDto });
            return Ok(result);
        }

        [HttpPost("SendVerificationCode")]
        public async Task<ActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto sendVerificationCodeDto)
        {
            var result = await Sender.Send(new SendVerificationCodeCommand { SendVerificationCodeDto = sendVerificationCodeDto });
            return result ? Ok() : BadRequest();
        }

    }
}
