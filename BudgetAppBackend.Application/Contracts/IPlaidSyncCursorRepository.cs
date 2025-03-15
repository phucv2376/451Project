using BudgetAppBackend.Domain.PlaidTransactionAggregate.Entities;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Contracts
{
    public interface IPlaidSyncCursorRepository
    {
        Task<PlaidSyncCursor?> GetLastCursorAsync(UserId userId, string accessToken);

        Task SaveCursorAsync(PlaidSyncCursor cursor);

        Task<List<PlaidSyncCursor>> GetUserCursorsAsync(UserId userId);

        Task DeleteCursorAsync(UserId userId, string accessToken);
    }
}
