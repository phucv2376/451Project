using FluentValidation;

namespace BudgetAppBackend.Application.Features.Authentication.RefToken
{
    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {

        public RefreshTokenCommandValidator()
        {
            RuleFor(x => x.RefreshToken.Email)
                .NotEmpty().WithMessage("Email is required. Please enter your email address.")
                .EmailAddress().WithMessage("Invalid email format. Please enter a valid email like example@domain.com.")
                .Must(email => email == email.ToLower()).WithMessage("Email must be in lowercase.");

            RuleFor(x => x.RefreshToken.Token)
                .NotEmpty().WithMessage("Token is required. Please enter your token.");
        }
    }
}
