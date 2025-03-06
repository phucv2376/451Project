using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Exceptions.BudgetExceptions;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Budgets.CreateBudget
{
    public class CreateBudgetCommandHandler : IRequestHandler<CreateBudgetCommand, Unit>
    {
        private readonly IBudgetRepository _budgetRepository;
        private readonly ITransactionRepository _transactionRepository;

        public CreateBudgetCommandHandler(
            IBudgetRepository budgetRepository,
            ITransactionRepository transactionRepository)
        {
            _budgetRepository = budgetRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task<Unit> Handle(CreateBudgetCommand request, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(request.CreateBudgetDto.UserId);
            var categoryId = CategoryId.Create(request.CreateBudgetDto.CategoryId);
            var createdDate = DateTime.UtcNow;

            var existingBudget = await _budgetRepository.GetByCategoryAsync(categoryId, cancellationToken);

            if (existingBudget != null)
            {
                throw new BudgetAlreadyExistsException(userId.Id, categoryId.Id);
            }

            var budget = Budget.Create(
                userId, 
                request.CreateBudgetDto.Title, 
                request.CreateBudgetDto.TotalAmount, 
                categoryId, createdDate
            );

            var pastTransactions = await _transactionRepository.GetTransactionsByUserAndCategoryAsync(userId, categoryId, createdDate, cancellationToken);

            budget.ApplyPastTransactions(pastTransactions);

            await _budgetRepository.AddAsync(budget, cancellationToken);

            return Unit.Value;
        }
    }
}
