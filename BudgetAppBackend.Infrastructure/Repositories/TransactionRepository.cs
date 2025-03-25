using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public TransactionRepository(ApplicationDbContext context)
        {
            _dbContext = context;
        }
        public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken)
        {
            await _dbContext.Transactions.AddAsync(transaction, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Transaction transaction, CancellationToken cancellationToken)
        {
            _dbContext.Transactions.Remove(transaction);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<Transaction?> GetByIdAsync(TransactionId transactionId, CancellationToken cancellationToken)
        {
            var transaction = await _dbContext.Transactions
                .FirstOrDefaultAsync(t => t.Id == transactionId, cancellationToken);

            return transaction;

        }

        public async Task<IEnumerable<TransactionDto>> GetRecentTransactionsByUserAsync(UserId userId, CancellationToken cancellationToken)
        {
            var transactions = await _dbContext.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedDate)
                .Take(5)
                .Select(t => new TransactionDto(
                    t.Id.Id,
                    t.TransactionDate,
                    t.Amount,
                    t.Payee,
                    t.Categories))
                .ToListAsync(cancellationToken);

            return transactions;
        }


        public async Task<IEnumerable<Transaction>> GetTransactionsByUserAndCategoryAsync(
            UserId userId,
            string category,
            DateTime budgetCreatedDate,
            CancellationToken cancellationToken)
        {
            var lowerCategory = category.ToLower();

            // Step 1: Filter by EF-translateable properties
            var transactions = await _dbContext.Transactions
                .Where(t => t.UserId == userId &&
                            t.TransactionDate.Month == budgetCreatedDate.Month &&
                            t.TransactionDate.Year == budgetCreatedDate.Year)
                .ToListAsync(cancellationToken);

            // Step 2: Filter by category in memory
            var filtered = transactions
                .Where(t => t.Categories.FirstOrDefault() != null &&
                            t.Categories.FirstOrDefault()!.ToLower().Contains(lowerCategory))
                .ToList();

            return filtered;
        }



        public async Task<decimal> GetTotalExpensesForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken)
        {
            return await _dbContext.Transactions
                .Where(t => t.UserId == userId &&
                            t.TransactionDate.Year == currentDate.Year &&
                            t.TransactionDate.Month == currentDate.Month &&
                            t.Type == TransactionType.Expense)
                .SumAsync(t => (decimal?)t.Amount ?? 0, cancellationToken);
        }

        public async Task<decimal> GetTotalIncomeForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken)
        {
            return await _dbContext.Transactions
                .Where(t => t.UserId == userId &&
                            t.TransactionDate.Year == currentDate.Year &&
                            t.TransactionDate.Month == currentDate.Month &&
                            t.Type == TransactionType.Income)
                .SumAsync(t => (decimal?)t.Amount ?? 0, cancellationToken);
        }

        public Task<IQueryable<TransactionDto>> GetUserTransactionsQueryAsync(UserId userId, CancellationToken cancellationToken)
        {
            var transactionsQuery = _dbContext.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedDate)
                .Select(t => new TransactionDto(
                     t.Id.Id,
                    t.TransactionDate,
                    t.Amount,
                    t.Payee,
                    t.Categories
                ))
                .AsQueryable();

            return Task.FromResult(transactionsQuery);
        }



        public async Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken)
        {
            _dbContext.Transactions.Update(transaction);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<TransactionDto>> GetThreeMonthTransactionsByUserIdAsync(UserId userId)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-90);
            var transactions = await _dbContext.Transactions
                                               .Where(t => t.UserId == userId && t.TransactionDate >= cutoffDate)
                                               .ToListAsync();

            return transactions.Select(t => new TransactionDto(
                 t.Id.Id,
                 t.TransactionDate,
                 t.Amount,
                 t.Payee,
                 t.Categories)).ToList();
        }

    }
}
