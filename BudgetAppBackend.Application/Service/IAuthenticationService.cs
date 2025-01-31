using BudgetAppBackend.Domain.UserAggregate;

namespace BudgetAppBackend.Application.Service
{
    public interface IAuthenticationService
    {
        string GenerateToken(User user);
        bool ValidateToken(string token);
    }
}
