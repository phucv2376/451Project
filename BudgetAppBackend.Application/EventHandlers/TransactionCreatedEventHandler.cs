using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.DomainEvents;
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
            var categoryId = CategoryId.Create(notification.categoryId);
            var budget = await _budgetRepository.GetByCategoryAsync(categoryId, cancellationToken);

            if (budget is not null)
            {
                budget.ApplyTransaction(notification.amount);
                await _budgetRepository.UpdateAsync(budget, cancellationToken);
            }
        }
    }
}
