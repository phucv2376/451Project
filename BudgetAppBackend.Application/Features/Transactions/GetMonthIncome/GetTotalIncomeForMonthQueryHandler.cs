using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetMonthIncome
{
    public class GetTotalIncomeForMonthQueryHandler : IRequestHandler<GetTotalIncomeForMonthQuery, decimal>
    {
        private readonly ITransactionRepository _transactionRepository;

        public GetTotalIncomeForMonthQueryHandler(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }
        public async Task<decimal> Handle(GetTotalIncomeForMonthQuery request, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(request.UserId);
            var currentDate = DateTime.UtcNow;
            return await _transactionRepository.GetTotalIncomeForMonthAsync(userId, currentDate, cancellationToken);
        }
    }
}
