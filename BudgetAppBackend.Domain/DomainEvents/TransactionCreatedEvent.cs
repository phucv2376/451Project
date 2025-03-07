using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record TransactionCreatedEvent(Guid UserId, Guid categoryId, decimal amount) : IDomainEvent
    {

    }
}
