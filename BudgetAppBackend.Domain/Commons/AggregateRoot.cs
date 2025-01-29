namespace BudgetAppBackend.Domain.Commons
{
    public abstract class AggregateRoot<TId> : Entity<TId> where TId : notnull
    {


        protected AggregateRoot(TId id) : base(id)
        {
        }

        private AggregateRoot() : base(default)
        {

            // It's mainly used for ORM frameworks that require a parameterless constructor.
        }


    }
}
