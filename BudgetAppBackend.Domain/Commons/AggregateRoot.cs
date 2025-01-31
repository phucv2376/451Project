namespace BudgetAppBackend.Domain.Commons
{
    public abstract class AggregateRoot<TId> : Entity<TId> where TId : notnull
    {

        private readonly List<IDomainEvent> _domainEvents = new List<IDomainEvent>();

        public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        protected AggregateRoot(TId id) : base(id)
        {
        }

        private AggregateRoot() : base(default)
        {

            // It's mainly used for ORM frameworks that require a parameterless constructor.
        }

        protected void RaiseDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }

    }
}
