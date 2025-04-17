using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record TransactionCreatedEvent(Guid UserId, string category, decimal amount, DateTime Date, string payee) : IDomainEvent
    {

    }
}
