using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.PlaidTransactionAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class PlaidTransactionRepository : IPlaidTransactionRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PlaidTransactionRepository> _logger;

        public PlaidTransactionRepository(ApplicationDbContext context, ILogger<PlaidTransactionRepository> logger)
        {
            _context = context;
            _logger = logger;

        }

        public async Task AddTransactionsAsync(IEnumerable<PlaidTransaction> transactions)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var uniqueTransactions = transactions
                    .GroupBy(t => t.PlaidTransactionId)
                    .Select(g => g.First())
                    .ToList();

                var existingIds = await _context.PlaidTransactions
                    .Where(t => uniqueTransactions.Select(ut => ut.PlaidTransactionId).Contains(t.PlaidTransactionId))
                    .Select(t => t.PlaidTransactionId)
                    .ToListAsync();

                var newTransactions = uniqueTransactions
                    .Where(t => !existingIds.Contains(t.PlaidTransactionId))
                    .ToList();

                if (newTransactions.Any())
                {
                    await _context.PlaidTransactions.AddRangeAsync(newTransactions);
                }

                if (existingIds.Any())
                {
                    _logger.LogInformation(
                        "{Count} transactions already exist and will be skipped: {Ids}",
                        existingIds.Count,
                        string.Join(", ", existingIds));
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {

                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PlaidTransaction?> GetByPlaidIdAsync(string plaidTransactionId)
        {
            return await _context.PlaidTransactions
                .FirstOrDefaultAsync(t => t.PlaidTransactionId == plaidTransactionId);
        }

        public async Task<List<TransactionDto>> GetRecentTransactionsByUserAsync(UserId userId, CancellationToken cancellationToken)
        {
            var transactions = await _context.PlaidTransactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .Take(5)
                .Select(t => new TransactionDto(
                    t.Id.Id,
                    t.Date,
                    t.Amount,
                    t.Name,
                    t.Category))
                .ToListAsync(cancellationToken);

            return transactions;
        }

        public async Task<decimal> GetTotalExpensesForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken)
        {
            return await _context.PlaidTransactions
                .Where(t => t.UserId == userId &&
                            t.Date.Year == currentDate.Year &&
                            t.Date.Month == currentDate.Month &&
                            t.Category != "PlaidTransactions")
                .SumAsync(t => (decimal?)t.Amount ?? 0, cancellationToken);
        }

        public async Task<decimal> GetTotalIncomeForMonthAsync(UserId userId, DateTime currentDate, CancellationToken cancellationToken)
        {
            return await _context.PlaidTransactions
                .Where(t => t.UserId == userId &&
                            t.Date.Year == currentDate.Year &&
                            t.Date.Month == currentDate.Month &&
                            t.Category == "Payment")
                .SumAsync(t => (decimal?)t.Amount ?? 0, cancellationToken);
        }

        public Task<IQueryable<TransactionDto>> GetUserTransactionsQueryAsync(UserId userId, CancellationToken cancellationToken)
        {
            var transactionsQuery = _context.PlaidTransactions
                .AsNoTracking()
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .Select(t => new TransactionDto(
                    t.Id.Id,
                    t.Date,
                    t.Amount,
                    t.Name,
                    t.Category
                ))
                .AsQueryable();

            return Task.FromResult(transactionsQuery);
        }

        public async Task<List<PlaidTransaction>> GetTransactionsByUserAndCategoryAsync(UserId userId, string category, DateTime budgetCreatedDate, CancellationToken cancellationToken)
        {

            var trans = await _context.PlaidTransactions
                .Where(t => t.UserId == userId &&
                            t.Category == category &&
                            t.Date.Month == budgetCreatedDate.Month &&
                            t.Date.Year == budgetCreatedDate.Year)
                .ToListAsync(cancellationToken);

            return trans;
        }

        public async Task<List<PlaidTransaction>> GetUserTransactionsAsync(UserId userId, DateTime startDate, DateTime endDate)
        {
            return await _context.PlaidTransactions
                .Where(t => t.UserId == userId
                    && t.Date >= startDate
                    && t.Date <= endDate
                    && !t.IsRemoved)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task MarkTransactionsAsRemovedAsync(IEnumerable<string> transactionIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var uniqueIds = transactionIds.Distinct().ToList();
                var transactions = await _context.PlaidTransactions
                    .Where(t => uniqueIds.Contains(t.PlaidTransactionId))
                    .ToListAsync();

                if (!transactions.Any())
                {

                    return;
                }

                var missingIds = uniqueIds.Except(transactions.Select(t => t.PlaidTransactionId));
                if (missingIds.Any())
                {
                    
                }

                foreach (var plaidTransaction in transactions)
                {
                    plaidTransaction.MarkAsRemoved();
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task UpdateTransactionsAsync(IEnumerable<PlaidTransaction> transactions)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var uniqueTransactions = transactions
                    .GroupBy(t => t.PlaidTransactionId)
                    .Select(g => g.First())
                    .ToList();

                foreach (var plaidTransaction in uniqueTransactions)
                {
                    var existingTransaction = await _context.PlaidTransactions
                        .FirstOrDefaultAsync(t => t.PlaidTransactionId == plaidTransaction.PlaidTransactionId);

                    if (existingTransaction == null)
                    {
                     
                        continue;
                    }

                    _context.Update(plaidTransaction);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<TransactionDto>> GetThreeMonthTransactionsByUserIdAsync(UserId userId)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-90);
            var transactions = await _context.PlaidTransactions
                                    .Where(t => t.UserId == userId && t.Date >= cutoffDate)
                                    .ToListAsync();

            return transactions.Select(t => new TransactionDto(
                t.Id.Id,
                t.Date,
                t.Amount,
                t.Name,
                t.Category
            ));
        }
    }
}