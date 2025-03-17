using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Contracts
{
    public interface ITransactionRepository
    {
        //CRUD
        Task AddAsync(Transaction transaction, CancellationToken cancellationToken);
        Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken);
        Task DeleteAsync(Transaction transaction, CancellationToken cancellationToken);

        //Financel summary
        Task<decimal> GetTotalIncomeForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken);
        Task<decimal> GetTotalExpensesForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken);


        Task<Transaction?> GetByIdAsync(TransactionId transactionId, CancellationToken cancellationToken);
        Task<IQueryable<TransactionDto>> GetUserTransactionsQueryAsync(UserId userId, CancellationToken cancellationToken);
        Task<IEnumerable<TransactionDto>> GetRecentTransactionsByUserAsync(UserId userId, CancellationToken cancellationToken);
        Task<IEnumerable<Transaction>> GetTransactionsByUserAndCategoryAsync(UserId userId, string category, DateTime budgetCreatedDate, CancellationToken cancellationToken);

        //AI
        Task<IEnumerable<TransactionDto>> GetThreeMonthTransactionsByUserIdAsync(UserId userId);
    }
}
