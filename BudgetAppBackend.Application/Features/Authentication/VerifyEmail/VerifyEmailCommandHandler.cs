using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.VerifyEmail
{
    public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, AuthResult>
    {
        private readonly IAuthRepository _authRepository;

        public VerifyEmailCommandHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<AuthResult> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.VerifyEmailDto.Email))
            {
                return new AuthResult { Success = false, Message = "Email cannot be empty" };
            }

            if (string.IsNullOrEmpty(request.VerifyEmailDto.Code))
            {
                return new AuthResult { Success = false, Message = "Code cannot be empty" };
            }

            var user = await _authRepository.GetUserByEmailAsync(request.VerifyEmailDto.Email);
            if (user == null)
            {
                return new AuthResult { Success = false, Message = "User not found" };
            }

            if (!user.VerifyEmail(request.VerifyEmailDto.Code))
            {
                return new AuthResult { Success = false, Message = "Verification code does not match" };
            }

            await _authRepository.UpdateUserAsync(user);

            return new AuthResult { Success = true, UserId = user.Id.Id, Message = "Email verification has been completed" };
        }
    }
}
