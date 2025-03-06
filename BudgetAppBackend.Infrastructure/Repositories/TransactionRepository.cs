using System.Linq;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.CategoryAggregate;
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
            return await _dbContext.Transactions
                .FirstOrDefaultAsync(t => t.Id == transactionId, cancellationToken);
        }

        public async Task<List<TransactionDto>> GetRecentTransactionsByUserAsync(UserId userId, CancellationToken cancellationToken)
        {
            var transactions = await _dbContext.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedDate)
                .Take(5)
                .Join(_dbContext.Categories,
                      t => t.CategoryId,
                      c => c.Id,
                      (t, c) => new TransactionDto(
                          t.Id.Id,
                          t.Amount,
                          t.TransactionDate,
                          t.CategoryId.Id,
                          c.Name,
                          t.Payee))
                .ToListAsync(cancellationToken);

            return transactions;
        }
        public async Task<List<Transaction>> GetTransactionsByUserAndCategoryAsync(UserId userId, CategoryId categoryId, DateTime budgetCreatedDate, CancellationToken cancellationToken)
        {
            return await _dbContext.Transactions
                .Where(t => t.UserId == userId &&
                            t.CategoryId == categoryId &&
                            t.TransactionDate.Month == budgetCreatedDate.Month &&
                            t.TransactionDate.Year == budgetCreatedDate.Year)
                .ToListAsync(cancellationToken);
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
                    t.Amount,
                    t.TransactionDate,
                    t.CategoryId.Id,
                    _dbContext.Categories
                        .Where(c => c.Id == t.CategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault(),
                    t.Payee
                ))
                .AsQueryable();

            return Task.FromResult(transactionsQuery);
        }



        public async Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken)
        {
            _dbContext.Transactions.Update(transaction);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
