using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.DomainEvents;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.EventHandlers
{

    public class TransactionCreatedEventHandler : INotificationHandler<TransactionCreatedEvent>
    {
        private readonly IBudgetRepository _budgetRepository;
        public TransactionCreatedEventHandler(IBudgetRepository budgetRepository)
        {
            _budgetRepository = budgetRepository;
        }
        public async Task Handle(TransactionCreatedEvent notification, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(notification.UserId);
            var budget = await _budgetRepository.GetByCategoryAsync(notification.category, userId, notification.Date, cancellationToken);

            if (budget is not null)
            {
                budget.ApplyTransaction(notification.amount);
                await _budgetRepository.UpdateAsync(budget, cancellationToken);
            }
        }
    }
}
