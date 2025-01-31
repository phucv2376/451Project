using BudgetAppBackend.Application.Contracts;
using Konscious.Security.Cryptography;
using MediatR;
using System.Text;

namespace BudgetAppBackend.Application.Features.Authentication.ResetPassword
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
    {
        private readonly IAuthRepository _authRepository;

        public ResetPasswordCommandHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.resetPassword.Email);
            if (user == null)
            {
                throw new ArgumentException("Invalid email address.");
            }

            var (passwordHash, passwordSalt) = CreatePasswordHash(request.resetPassword.NewPassword);
            user.ChangePassword(passwordHash, passwordSalt);

            await _authRepository.UpdateUserAsync(user);

            return Unit.Value;
        }

        private static (byte[] passwordHash, byte[] passwordSalt) CreatePasswordHash(string password)
        {
            var passwordSalt = new byte[16];
            using var rng = new System.Security.Cryptography.RNGCryptoServiceProvider();
            rng.GetBytes(passwordSalt);

            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = passwordSalt,
                DegreeOfParallelism = 8,
                MemorySize = 65536,
                Iterations = 4
            };

            var passwordHash = argon2.GetBytes(64);
            return (passwordHash, passwordSalt);
        }
    }
}
