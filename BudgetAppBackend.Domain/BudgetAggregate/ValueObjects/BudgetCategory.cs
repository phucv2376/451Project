using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.BudgetAggregate.ValueObjects
{
    public class BudgetCategory : ValueObject
    {
        public CategoryId CategoryId { get; }
        public decimal Limit { get; }

        public BudgetCategory(CategoryId categoryId, decimal limit)
        {
            CategoryId = categoryId ?? throw new ArgumentNullException(nameof(categoryId));
            Limit = limit;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return CategoryId;
            yield return Limit;
        }
    }
}
