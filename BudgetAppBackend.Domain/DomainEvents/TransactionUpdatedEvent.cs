using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record TransactionUpdatedEvent(UserId UserId, CategoryId CategoryId, decimal OldAmount, decimal NewAmount) : IDomainEvent
    {
    }
}
