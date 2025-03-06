using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class BudgetRepository : IBudgetRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public BudgetRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(Budget budget, CancellationToken cancellationToken)
        {
            await _dbContext.Budgets.AddAsync(budget, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Budget budget, CancellationToken cancellationToken)
        {
            _dbContext.Budgets.Remove(budget);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<Budget>> GetActiveBudgetsAsync(UserId userId ,CancellationToken cancellationToken)
        {
            return await _dbContext.Budgets
                .Where(b => b.IsActive && b.UserId == userId)
                .ToListAsync(cancellationToken);
        }

        public async Task<Budget?> GetByCategoryAsync(CategoryId categoryId, CancellationToken cancellationToken)
        {
            return await _dbContext.Budgets
                .FirstOrDefaultAsync(b => b.CategoryId == categoryId, cancellationToken);
        }

        public async Task<Budget?> GetByIdAsync(BudgetId budgetId, CancellationToken cancellationToken)
        {
            return await _dbContext.Budgets
                .FirstOrDefaultAsync(b => b.Id == budgetId, cancellationToken);
        }

        public async Task UpdateAsync(Budget budget, CancellationToken cancellationToken)
        {
            _dbContext.Budgets.Update(budget);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<Budget>> GetAllBudgetsAsync()
        {
            return await _dbContext.Budgets.ToListAsync();
        }
    }
}
