using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record TransactionDeletedEvent(UserId UserId, CategoryId CategoryId, decimal Amount) : IDomainEvent
    {
    }
}
