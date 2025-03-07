using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.DomainEvents
{
    public sealed record BudgetExceededEvent(Guid UserId, Guid BudgetId, Guid CategoryId, decimal SpentAmount, decimal BudgetLimit) : IDomainEvent;
}
