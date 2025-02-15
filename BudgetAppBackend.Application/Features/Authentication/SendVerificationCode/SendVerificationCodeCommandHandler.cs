using System.ComponentModel.DataAnnotations;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.UserAggregate;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.SendVerificationCode
{
    public class SendVerificationCodeCommandHandler : IRequestHandler<SendVerificationCodeCommand, bool>
    {
        private readonly IAuthRepository _authRepository;
        
        public SendVerificationCodeCommandHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<bool> Handle(SendVerificationCodeCommand request, CancellationToken cancellationToken)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(request.SendVerificationCodeDto!);
            if (!Validator.TryValidateObject(request.SendVerificationCodeDto!, validationContext, validationResults, true))
            {
                throw new ValidationException(string.Join(", ", validationResults.Select(v => v.ErrorMessage!)));
            }

            var user = await _authRepository.GetUserByEmailAsync(request.SendVerificationCodeDto.Email);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            var verificationCode = User.GenerateVerificationToken();
            user.SetEmailVerificationCode(verificationCode, DateTime.UtcNow.AddHours(1), user.FirstName, user.LastName, user.Email);
            await _authRepository.UpdateUserAsync(user);

            return true;
        }
    }
}
