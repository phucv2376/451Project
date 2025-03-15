using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.PlaidTransactionAggregate;
using BudgetAppBackend.Domain.PlaidTransactionAggregate.Entities;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Contracts
{
    public interface IPlaidTransactionRepository
    {
        Task<PlaidTransaction?> GetByPlaidIdAsync(string plaidTransactionId);
        Task<List<PlaidTransaction>> GetUserTransactionsAsync(UserId userId, DateTime startDate, DateTime endDate); // is not being used
        Task<List<PlaidTransaction>> GetTransactionsByUserAndCategoryAsync(UserId userId, string category, DateTime budgetCreatedDate, CancellationToken cancellationToken);
        Task AddTransactionsAsync(IEnumerable<PlaidTransaction> transactions);
        Task UpdateTransactionsAsync(IEnumerable<PlaidTransaction> transactions);
        Task MarkTransactionsAsRemovedAsync(IEnumerable<string> plaidTransactionIds);
        Task<PlaidSyncCursor?> GetLastCursorAsync(UserId userId, string accessToken);
        Task SaveCursorAsync(PlaidSyncCursor cursor);

        Task<decimal> GetTotalIncomeForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken);
        Task<decimal> GetTotalExpensesForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken);
        Task<IQueryable<TransactionDto>> GetUserTransactionsQueryAsync(UserId userId, CancellationToken cancellationToken);
        Task<List<TransactionDto>> GetRecentTransactionsByUserAsync(UserId userId, CancellationToken cancellationToken);
    }
}
