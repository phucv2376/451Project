using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record BudgetExceededEvent(UserId UserId, BudgetId BudgetId, CategoryId CategoryId, decimal SpentAmount, decimal BudgetLimit) : IDomainEvent;
}
