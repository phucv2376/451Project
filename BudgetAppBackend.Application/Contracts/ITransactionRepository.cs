using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Contracts
{
    public interface ITransactionRepository
    {
        Task AddAsync(Transaction transaction, CancellationToken cancellationToken);
        Task<Transaction?> GetByIdAsync(TransactionId transactionId, CancellationToken cancellationToken);
        Task<IQueryable<TransactionDto>> GetUserTransactionsQueryAsync(UserId userId, CancellationToken cancellationToken);
        Task<List<TransactionDto>> GetRecentTransactionsByUserAsync(UserId userId, CancellationToken cancellationToken);
        Task<List<Transaction>> GetTransactionsByUserAndCategoryAsync(UserId userId, CategoryId categoryId, DateTime budgetCreatedDate, CancellationToken cancellationToken);
        Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken);
        Task DeleteAsync(Transaction transaction, CancellationToken cancellationToken);
        Task<decimal> GetTotalIncomeForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken);
        Task<decimal> GetTotalExpensesForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken);
    }
}
