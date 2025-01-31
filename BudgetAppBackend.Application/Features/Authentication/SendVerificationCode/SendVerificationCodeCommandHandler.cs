using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.Models;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.SendVerificationCode
{
    public class SendVerificationCodeCommandHandler : IRequestHandler<SendVerificationCodeCommand, bool>
    {
        private readonly IAuthRepository _authRepository;
        private readonly IEmailService _emailService;

        public SendVerificationCodeCommandHandler(IAuthRepository authRepository, IEmailService emailService)
        {
            _authRepository = authRepository;
            _emailService = emailService;
        }

        public async Task<bool> Handle(SendVerificationCodeCommand request, CancellationToken cancellationToken)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.SendVerificationCodeDto.Email);
            if (user == null)
            {
                return false;
            }

            var verificationCode = User.GenerateVerificationToken();
            user.SetEmailVerificationCode(verificationCode, DateTime.UtcNow.AddHours(1));
            await _authRepository.UpdateUserAsync(user);


            var emailBody = $@"
            <html>
            <head>
                <style>
                    .email-container {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                    }}
                    .email-header {{
                        background-color: #f8f8f8;
                        padding: 10px;
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                    }}
                    .email-content {{
                        padding: 20px;
                    }}
                    .email-footer {{
                        background-color: #f8f8f8;
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        color: #888;
                    }}
                </style>
            </head>
            <body>
                <div class='email-container'>
                    <div class='email-header'>Email Verification</div>
                    <div class='email-content'>
                        <p>Dear {user.FirstName} {user.LastName},</p>
                        <p>Your email verification code is <strong>{verificationCode}</strong>. It will expire in 1 hour. Please use this code to verify your email address.</p>
                    </div>
                    <div class='email-footer'>
                        <p>&copy; {DateTime.UtcNow.Year} BudgetApp. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";

            var emailVerification = new EmailMessage(
                user.Email,
                "Email Verification",
                emailBody,
                user.FirstName + " " + user.LastName
            );

            try
            {
                await _emailService.SendEmail(emailVerification, cancellationToken);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
