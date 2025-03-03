using BudgetAppBackend.Domain.UserAggregate;

namespace BudgetAppBackend.Application.Contracts;

public interface IAuthRepository
{
    Task RegisterAsync(User addNewUser, CancellationToken cancellationToken);
    Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken);
    Task UpdateUserAsync(User user, CancellationToken cancellationToken);
    Task DeleteUserAsync(Task<User?> user, CancellationToken cancellationToken);
}
