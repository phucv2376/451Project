using AutoMapper;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Models;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate;
using Konscious.Security.Cryptography;
using MediatR;
using System.Text;

namespace BudgetAppBackend.Application.Features.Authentication.Registration
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResult>
    {
        public readonly IMapper _mapper;
        private readonly IAuthRepository? _authRepository;
        private readonly IEmailService _emailService;
        public byte[]? PasswordHash { get; private set; }
        public byte[]? PasswordSalt { get; private set; }

        public RegisterUserCommandHandler(IMapper mapper, IAuthRepository? authRepository,
            IEmailService emailService)
        {
            _mapper = mapper;
            _authRepository = authRepository;
            _emailService = emailService;
        }

        public async Task<AuthResult> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _mapper.Map<User>(request.AddUser);
            CreatePasswordHash(request.AddUser!.Password, out byte[] passwordHash, out byte[] passwordSalt);
            PasswordHash = passwordHash;
            PasswordSalt = passwordSalt;
            var newUser = User.CreateNewUser(
                currentUser.FirstName,
                currentUser.LastName,
                currentUser.Email,
                passwordHash,
                passwordSalt
            );

            var verificationCode = User.GenerateVerificationToken();
            newUser.SetEmailVerificationCode(verificationCode, DateTime.UtcNow.AddHours(1));
            await _authRepository!.Register(newUser);

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
                                    <p>Dear {newUser.FirstName} {newUser.LastName},</p>
                                    <p>Your email verification code is <strong>{verificationCode}</strong>. It will expire in 1 hour. Please use this code to verify your email address.</p>
                                </div>
                                <div class='email-footer'>
                                    <p>&copy; {DateTime.UtcNow.Year} BudgetApp. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>";


            var emailVerification = new EmailMessage(
                newUser.Email,
                "Email Verification",
                emailBody,
                newUser.FirstName + " " + newUser.LastName
            );

            try
            {
                await _emailService.SendEmail(emailVerification, cancellationToken);

            }
            catch (Exception e)
            {
                throw new Exception("Failed to send verification email.", e);
                //failed to send email does not affect the registration process
            }


            var authResult = new AuthResult { Success = true, UserId = newUser.Id.Id, Message = $"An email verification has been sent to you. {verificationCode}" };
            return authResult;
         
        }

        public static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            // Generate a 16-byte random salt
            passwordSalt = new byte[16];
            using var rng = new System.Security.Cryptography.RNGCryptoServiceProvider();
            rng.GetBytes(passwordSalt);

            // Hash the password using Argon2
            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
            argon2.Salt = passwordSalt;
            argon2.DegreeOfParallelism = 8;    // Number of threads
            argon2.MemorySize = 65536;         // 64 MB of memory
            argon2.Iterations = 4;             // Number of iterations

            passwordHash = argon2.GetBytes(64); // 64-byte hash output
        }
    }
}
