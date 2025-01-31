using BudgetAppBackend.Application.Models;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.DomainEvents;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.Events
{
    public sealed class EmailVerificationCodeGeneratedEventHandler : INotificationHandler<EmailVerificationCodeGeneratedEvent>
    {
        private readonly IEmailService _emailService;

        public EmailVerificationCodeGeneratedEventHandler(IEmailService emailService)
        {
            _emailService = emailService;
        }
        public async Task Handle(EmailVerificationCodeGeneratedEvent notification, CancellationToken cancellationToken)
        {
            string emailBody = $@"
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
                            <p>Dear {notification.firstName} {notification.lastName},</p>
                            <p>Your email verification code is <strong>{notification.code}</strong>. It will expire in 1 hour. Please use this code to verify your email address.</p>
                        </div>
                        <div class='email-footer'>
                            <p>&copy; {DateTime.UtcNow.Year} BudgetApp. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            var emailMessage = new EmailMessage(
                notification.email,
                "Email Verification",
                emailBody,
                $"{notification.firstName} {notification.lastName}"
            );

            try
            {
                await _emailService.SendEmail(emailMessage, cancellationToken);
            }
            catch (Exception e)
            {
                throw new Exception("Failed to send verification email.", e);
            }
        }
    }
}
