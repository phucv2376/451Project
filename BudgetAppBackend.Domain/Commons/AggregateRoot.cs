namespace BudgetAppBackend.Domain.Commons
{
    public abstract class AggregateRoot : Entity
    {
        private readonly List<IDomainEvent> _domainEvents = new();

        public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        protected void RaiseDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }
    }

    // Keep your generic version as well, inheriting from the base class
    public abstract class AggregateRoot<TId> : AggregateRoot
        where TId : notnull
    {
        public TId Id { get; protected set; } = default!;
        protected AggregateRoot() { }
    }
}
