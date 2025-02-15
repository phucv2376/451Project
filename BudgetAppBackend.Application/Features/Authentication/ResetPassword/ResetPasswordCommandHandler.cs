using System.ComponentModel.DataAnnotations;
using BudgetAppBackend.Application.Contracts;
using MediatR;

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
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(request.resetPassword!);
            if (!Validator.TryValidateObject(request.resetPassword!, validationContext, validationResults, true))
            {
                throw new ValidationException(string.Join(", ", validationResults.Select(v => v.ErrorMessage!)));
            }

            var user = await _authRepository.GetUserByEmailAsync(request.resetPassword.Email);
            if (user == null)
            {
                throw new KeyNotFoundException("Invalid email address.");
            }

            if (request.resetPassword.NewPassword != request.resetPassword.ConfirmNewPassword)
            {
                throw new ArgumentException("Passwords do not match.");
            }

            user.ChangePassword(request.resetPassword.NewPassword);

            await _authRepository.UpdateUserAsync(user);

            return Unit.Value;
        }
    }
}
