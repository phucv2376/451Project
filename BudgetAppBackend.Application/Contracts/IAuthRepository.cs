using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Domain.UserAggregate;

namespace BudgetAppBackend.Application.Contracts
{
    public interface IAuthRepository
    {
        Task Register(User addNewUser);
        Task<User> GetUserByEmailAsync(string email);
        Task UpdateUserAsync(User user);
    }
}
