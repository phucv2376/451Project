using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.CategoryAggregate
{
    public sealed class Category : AggregateRoot<CategoryId>
    {
        public string Name { get; private set; }

        private Category() : base(default!)
        {
        }

        private Category(CategoryId id, string name) : base(id)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name cannot be empty.");
            Name = name;
        }

        public static Category Create(string name)
        {
            return new Category(CategoryId.CreateId(), name);
        }
    }
}
