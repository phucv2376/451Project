using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.BudgetAggregate
{
    public sealed class Budget : AggregateRoot<BudgetId>
    {
        public string Title { get; private set; }
        public decimal TotalAmount { get; private set; }
        public Guid UserId { get; private set; }

        private readonly List<BudgetCategory> _categories = new();
        public IReadOnlyList<BudgetCategory> Categories => _categories.AsReadOnly();

        private readonly Dictionary<CategoryId, decimal> _categorySpentAmounts = new();


        private Budget() : base(default!) { } // For EF Core

        private Budget(BudgetId id, Guid userId, string title, decimal totalAmount, List<BudgetCategory> categories) : base(id)
        {
            UserId = userId;
            Title = title;
            TotalAmount = totalAmount;
            _categories = categories ?? throw new ArgumentNullException(nameof(categories));
        }
       
        public void UpdateSpentAmount(CategoryId categoryId, decimal amount)
        {
            if (_categorySpentAmounts.ContainsKey(categoryId))
            {
                _categorySpentAmounts[categoryId] += amount;
            }
            else
            {
                _categorySpentAmounts[categoryId] = amount;
            }
        }

        public decimal GetRemainingBalance(CategoryId categoryId)
        {
            var limit = _categories.FirstOrDefault(c => c.CategoryId == categoryId)?.Limit ?? 0;
            var spent = _categorySpentAmounts.TryGetValue(categoryId, out var amount) ? amount : 0;
            return limit - spent;
        }
    }
}
