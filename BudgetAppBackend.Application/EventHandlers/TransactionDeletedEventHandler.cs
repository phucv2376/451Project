using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.DomainEvents;
using MediatR;

namespace BudgetAppBackend.Application.EventHandlers
{
    public class TransactionDeletedEventHandler : INotificationHandler<TransactionDeletedEvent>
    {
        private readonly IBudgetRepository _budgetRepository;

        public TransactionDeletedEventHandler(IBudgetRepository budgetRepository)
        {
            _budgetRepository = budgetRepository;
        }
        public async Task Handle(TransactionDeletedEvent notification, CancellationToken cancellationToken)
        {
            var budget = await _budgetRepository.GetByCategoryAsync(notification.CategoryId, cancellationToken);

            if (budget is not null)
            {
                budget.RollbackTransaction(notification.Amount);

                await _budgetRepository.UpdateAsync(budget, cancellationToken);
            }
        }
    }
}
