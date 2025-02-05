using AutoMapper;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Domain.UserAggregate;
using MediatR;

namespace BudgetAppBackend.Application.Features.Authentication.Registration
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResult>
    {
        public readonly IMapper _mapper;
        private readonly IAuthRepository? _authRepository;

        public RegisterUserCommandHandler(IMapper mapper, IAuthRepository? authRepository)
        {
            _mapper = mapper;
            _authRepository = authRepository;
        }

        public async Task<AuthResult> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _mapper.Map<User>(request.AddUser);
            var IsEmailExist = await _authRepository!.GetUserByEmailAsync(currentUser.Email);
            if (IsEmailExist != null)
            {
                return new AuthResult { Success = false, Message = "Email already exist" };
            }

            var newUser = User.CreateNewUser(
                currentUser.FirstName,
                currentUser.LastName,
                currentUser.Email,
               request.AddUser.Password
            );

            var verificationCode = User.GenerateVerificationToken();
            newUser.SetEmailVerificationCode(verificationCode, DateTime.UtcNow.AddHours(1), newUser.FirstName, newUser.LastName, newUser.Email);
            await _authRepository!.Register(newUser);

            var authResult = new AuthResult { Success = true, UserId = newUser.Id.Id, Message = $"An email verification has been sent to you." };
            return authResult;
         
        }

    }
}
