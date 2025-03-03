using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.CategoryAggregate
{
    public sealed class CategoryId : ValueObject
    {
        public Guid Id { get; private set; }

        private CategoryId(Guid id)
        {
            Id = id;
        }


        public static CategoryId CreateId()
        {
            return new CategoryId(Guid.NewGuid());
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Id;
        }

        public static CategoryId Create(Guid? id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id), "Guid value cannot be null.");
            }
            return new CategoryId(id.Value);
        }
    }
}
