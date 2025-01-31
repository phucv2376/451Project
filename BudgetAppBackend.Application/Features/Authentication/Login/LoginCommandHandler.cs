using System.Text;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Service;
using Konscious.Security.Cryptography;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResult>
    {
        private readonly IAuthRepository? _authRepository;
        private readonly IAuthenticationService? _authenticationService;

        public LoginCommandHandler(IAuthRepository? authRepository, IAuthenticationService? authenticationService)
        {
            _authRepository = authRepository;
            _authenticationService = authenticationService;
        }

        public async Task<AuthResult> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _authRepository!.GetUserByEmailAsync(request.LogUser!.Email!);

            if (user == null! || !VerifyPasswordHash(request.LogUser.Password!, user.PasswordHash, user.PasswordSalt))
            {
                return new AuthResult { Success = false, Message = "Wrong Email/Password" };
            }

            /*if (user.IsEmailVerified == false)
            {
                return new AuthResult { Success = false, Message = "Please verify your email" };
            }*/

            var token = _authenticationService!.GenerateToken(user);

            //return new AuthResult { Success = true, UserId = user.Id, Token = token, Message = "You logged in successfully" };
            return new AuthResult { Success = true, UserId = user.Id.Id, Token = token, Message = "You logged in successfully" };
        }

        private static bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            // Use Argon2 for password verification
            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
            argon2.Salt = passwordSalt;
            argon2.DegreeOfParallelism = 8;   // Number of threads
            argon2.MemorySize = 65536;        // 64 MB of memory
            argon2.Iterations = 4;            // Number of iterations

            var computedHash = argon2.GetBytes(64);  // Generate a 64-byte hash
            return AreHashesEqual(computedHash, passwordHash);
        }

        private static bool AreHashesEqual(byte[] computedHash, byte[] storedHash)
        {
            if (computedHash.Length != storedHash.Length) return false;

            bool areEqual = true;
            for (int i = 0; i < computedHash.Length; i++)
            {
                areEqual &= (computedHash[i] == storedHash[i]);
            }

            return areEqual;
        }
    }
}
