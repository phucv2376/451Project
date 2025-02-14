using BudgetAppBackend.Domain.UserAggregate.Entities;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Contracts
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByUserIdAsync(UserId userId);
        Task SaveAsync(RefreshToken refreshToken);
        Task UpdateAsync(RefreshToken refreshToken);
        Task DeleteAsync(RefreshToken refreshToken);
        Task UpdateAndSaveNewAsync(RefreshToken oldToken, RefreshToken newToken);
    }
}
