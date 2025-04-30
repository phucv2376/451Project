using System.Globalization;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.BudgetDTOs;
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

        public async Task<IEnumerable<TransactionDto>> GetUserTransactionsByDateRangeAsync(UserId userId, DateTime startDate, bool onlyWithCategory, CancellationToken cancellationToken)
        {
            var query = await _dbContext.Transactions
                .Where(t => t.UserId == userId)
                .Where(t => t.TransactionDate >= startDate)
                .ToListAsync(cancellationToken);
            
            if (onlyWithCategory)
            {
                query = query
                    .Where(t => t.Categories.FirstOrDefault() != null)
                    .ToList();
            }

            return query.Select(t => new TransactionDto(
                 t.Id.Id,
                 t.TransactionDate,
                 t.Amount,
                 t.Payee,
                 t.Categories)).ToList();
        }

        public async Task<IEnumerable<DetailedDailyCashFlowDto>> GetDetailedDailyCashFlowAsync(
             UserId userId,
             DateTime monthStartDate,
             CancellationToken cancellationToken)
        {
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            var transactions = await _dbContext.Transactions
                .Where(t => t.UserId == userId &&
                            t.TransactionDate >= monthStartDate &&
                            t.TransactionDate <= monthEndDate)
                .ToListAsync(cancellationToken);

            var grouped = transactions
                .GroupBy(t => DateTime.SpecifyKind(t.TransactionDate.Date, DateTimeKind.Utc))
                .ToDictionary(
                    g => g.Key,
                    g =>
                    {
                        var income = g.Where(t => t.Amount > 0).Sum(t => t.Amount);
                        var expense = g.Where(t => t.Amount < 0).Sum(t => Math.Abs(t.Amount));
                        var net = income - expense;
                        return new { Income = income, Expense = expense, Net = net };
                    });

            var allDates = Enumerable.Range(0, (monthEndDate - monthStartDate).Days + 1)
                .Select(offset => DateTime.SpecifyKind(monthStartDate.AddDays(offset).Date, DateTimeKind.Utc));

            var results = new List<DetailedDailyCashFlowDto>();
            decimal runningTotal = 0;

            foreach (var date in allDates)
            {
                var income = grouped.TryGetValue(date, out var data) ? data.Income : 0;
                var expense = grouped.TryGetValue(date, out var data2) ? data2.Expense : 0;
                var net = income - expense;
                runningTotal += net;

                results.Add(new DetailedDailyCashFlowDto(
                    Date: date,
                    Income: income,
                    Expense: expense,
                    NetCashFlow: net,
                    CumulativeCashFlow: runningTotal
                ));
            }

            return results;
        }

        public async Task<List<MonthlyCategoryTotalDto>> GetCategoryTotalsForLastFourMonthsAsync(string categoryName, UserId userId, CancellationToken cancellationToken)
        {
            var fromDate = DateTime.UtcNow.AddMonths(-3); 
            var monthlyCategoryTotal = await _dbContext.Transactions
                .Where(t => t.UserId == userId && t.Categories.FirstOrDefault() == categoryName && t.TransactionDate >= fromDate)
                .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                .Select(g => new MonthlyCategoryTotalDto
                {
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key.Month),
                    Total = g.Sum(t => t.Amount)
                })
                .OrderBy(dto => DateTime.ParseExact(dto.Month, "MMMM", CultureInfo.CurrentCulture))
                .ToListAsync(cancellationToken);

            return monthlyCategoryTotal;
        }
    }
}
