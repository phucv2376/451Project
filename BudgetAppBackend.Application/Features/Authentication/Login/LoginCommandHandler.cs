using System.ComponentModel.DataAnnotations;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate.Entities;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResult>
    {
        private readonly IAuthRepository _authRepository;
        private readonly IAuthService _authenticationService;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public LoginCommandHandler(IAuthRepository authRepository, IAuthService authenticationService,
            IRefreshTokenRepository refreshTokenRepository)
        {
            _authRepository = authRepository;
            _authenticationService = authenticationService;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<AuthResult> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(request.LogUser!);
            if (!Validator.TryValidateObject(request.LogUser!, validationContext, validationResults, true))
            {
                return new AuthResult
                {
                    Success = false,
                    Message = string.Join(", ", validationResults.Select(v => v.ErrorMessage!))
                };
            }

            var user = await _authRepository.GetUserByEmailAsync(request.LogUser!.Email!);
            if (user == null || !user.VerifyPassword(request.LogUser.Password!))
            {
                return new AuthResult { Success = false, Message = "Wrong Email/Password" };
            }

            var token = _authenticationService.GenerateToken(user);
            var (rawRefreshToken, hashedRefreshToken) = _authenticationService.GenerateRefreshToken();

            var existingRefreshToken = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
            if (existingRefreshToken != null)
            {
                existingRefreshToken.Revoke();
                await _refreshTokenRepository.UpdateAsync(existingRefreshToken);
            }

            var refreshToken = new RefreshToken(user.Id, hashedRefreshToken, existingRefreshToken.ExpiryDate);
            await _refreshTokenRepository.SaveAsync(refreshToken);

            return new AuthResult
            {
                Success = true,
                UserId = user.Id.Id,
                Token = token,
                TokenType = "Bearer",
                ExpiresIn = 3600,
                RefreshToken = rawRefreshToken,
                RefreshTokenExpiry = existingRefreshToken.ExpiryDate,
                Message = "You logged in successfully"
            };
        }
    }
}
