using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record TransactionUpdatedEvent(Guid UserId, Guid CategoryId, decimal OldAmount, decimal NewAmount) : IDomainEvent
    {
    }
}
