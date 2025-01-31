using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Application.Service;
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
            var user = await _authRepository.GetUserByEmailAsync(request.LogUser!.Email!);
            if (user == null || !user.VerifyPassword(request.LogUser.Password!))
            {
                return new AuthResult { Success = false, Message = "Wrong Email/Password" };
            }

            var token = _authenticationService.GenerateToken(user);

            return new AuthResult
            {
                Success = true,
                UserId = user.Id.Id,
                Token = token,
                Message = "You logged in successfully"
            };
        }

    }
}
