using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetMonthExpense
{
    public class GetTotalExpensesForMonthQueryHandler : IRequestHandler<GetTotalExpensesForMonthQuery, decimal>
    {
        private readonly ITransactionRepository _transactionRepository;

        public GetTotalExpensesForMonthQueryHandler(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }
        public async Task<decimal> Handle(GetTotalExpensesForMonthQuery request, CancellationToken cancellationToken)
        {
            var userId =  UserId.Create(request.UserId);
            var currentDate = DateTime.UtcNow;
            return await _transactionRepository.GetTotalExpensesForMonthAsync(userId, currentDate, cancellationToken);
        }
    }
}
