using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate.Entities;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.RefToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResult>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IAuthService _authService;
        private readonly IAuthRepository _authRepository;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshTokenRepository,
            IAuthService authService,
            IAuthRepository authRepository)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _authService = authService;
            _authRepository = authRepository;
        }

        public async Task<AuthResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.RefreshToken.Email);

            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }
            var storedToken = await _refreshTokenRepository.GetByUserIdAsync(user.Id);

            if (storedToken == null)
            {
                throw new UnauthorizedAccessException("Refresh token not found.");
            }

            if (storedToken.ExpiryDate <= DateTime.UtcNow)
            {
                await _refreshTokenRepository.DeleteAsync(storedToken);
                throw new UnauthorizedAccessException("Refresh token expired. Please log in again.");
            }

            if (!_authService.ValidateRefreshToken(storedToken.TokenHash, request.RefreshToken.Token))
            {
                throw new UnauthorizedAccessException("Invalid refresh token.");
            }

           

            var newToken = _authService.GenerateToken(user);

            var (rawRefreshToken, hashedRefreshToken) = _authService.GenerateRefreshToken();

            storedToken.Revoke();
            await _refreshTokenRepository.UpdateAndSaveNewAsync(storedToken, new RefreshToken(user.Id, hashedRefreshToken, storedToken.ExpiryDate));

            return new AuthResult
            {
                Success = true,
                UserId = user.Id.Id,
                Token = newToken,
                TokenType = "Bearer",
                ExpiresIn = 3600,
                RefreshToken = rawRefreshToken,
                RefreshTokenExpiry = storedToken.ExpiryDate,
                Message = "You logged in successfully"
            };
        }
    }
}
