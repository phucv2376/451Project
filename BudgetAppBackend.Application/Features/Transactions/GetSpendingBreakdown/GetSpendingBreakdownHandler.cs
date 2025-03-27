using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetSpendingBreakdown
{
    public class GetSpendingBreakdownQueryHandler : IRequestHandler<GetSpendingBreakdownQuery, IEnumerable<CategoryTotalDto>>
    {

        private readonly ITransactionRepository _transactionReadRepository;
        private readonly IPlaidTransactionRepository _plaidTransactionRepository;

        public GetSpendingBreakdownQueryHandler(
            ITransactionRepository transactionReadRepository,
            IPlaidTransactionRepository plaidTransactionRepository)
        {
            _transactionReadRepository = transactionReadRepository;
            _plaidTransactionRepository = plaidTransactionRepository;
        }
        public async Task<IEnumerable<CategoryTotalDto>> Handle(GetSpendingBreakdownQuery request, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(request.UserId);

            var manualTransactions = await _transactionReadRepository.GetUserTransactionsQueryAsync(userId, cancellationToken);
            var plaidTransactions = await _plaidTransactionRepository.GetUserTransactionsQueryAsync(userId, cancellationToken);

            var manualTransactionsList = manualTransactions.ToList();
            var plaidTransactionsList = plaidTransactions.ToList();

            var allTransactions = manualTransactionsList.Concat(plaidTransactionsList)
                                         .OrderByDescending(t => t.TransactionDate)
                                         .AsQueryable();

            var monthStartDate = DateTime.UtcNow.AddDays(-30);  // from today go back 30 days.

            var spendingPerCategory = allTransactions.
                        Where(t => t.TransactionDate >= monthStartDate)
                        .Where(t => t.Categories.Any())
                        .Where (t => t.Amount < 0)
                        .GroupBy(t => t.Categories.First()) // Group by the primary category
                        .Select(g => new CategoryTotalDto { Category = g.Key, TotalAmount = g.Sum(t => t.Amount) })
                        .ToList();

            return spendingPerCategory;
        }
    }
}