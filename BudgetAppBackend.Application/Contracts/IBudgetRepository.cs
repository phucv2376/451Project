using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Contracts
{
    public interface IBudgetRepository
    {
        Task AddAsync(Budget budget, CancellationToken cancellationToken);//
        Task<Budget?> GetByIdAsync(BudgetId budgetId, CancellationToken cancellationToken);  //
        Task<List<Budget>> GetActiveBudgetsAsync(UserId userId, CancellationToken cancellationToken); //
        Task<Budget?> GetByCategoryAsync(CategoryId categoryId, CancellationToken cancellationToken); //
        Task UpdateAsync(Budget budget, CancellationToken cancellationToken); //
        Task DeleteAsync(Budget budget, CancellationToken cancellationToken);
        Task<List<Budget>> GetAllBudgetsAsync();
    }
}
