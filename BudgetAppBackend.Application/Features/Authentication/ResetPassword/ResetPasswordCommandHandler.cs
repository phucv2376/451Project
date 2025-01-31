using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.Extensions;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.ResetPassword
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
    {
        private readonly IAuthRepository _authRepository;
        private readonly IMediator _mediator;

        public ResetPasswordCommandHandler(IAuthRepository authRepository, IMediator mediator)
        {
            _authRepository = authRepository;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.resetPassword.Email);
            if (user == null)
            {
                throw new ArgumentException("Invalid email address.");
            }

            user.ChangePassword(request.resetPassword.NewPassword);

            await _authRepository.UpdateUserAsync(user);

            await _mediator.PublishDomainEventsAsync(new[] { user }, cancellationToken);

            return Unit.Value;
        }
    }
}
