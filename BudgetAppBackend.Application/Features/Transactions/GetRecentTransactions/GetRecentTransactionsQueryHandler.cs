using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetRecentTransactions
{
    public class GetRecentTransactionsQueryHandler : IRequestHandler<GetRecentTransactionsQuery, List<TransactionDto>>
    {
        private readonly ITransactionRepository _transactionRepository;
        public GetRecentTransactionsQueryHandler(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }
        public async Task<List<TransactionDto>> Handle(GetRecentTransactionsQuery request, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(request.UserId);
            var transactionsQuery = await _transactionRepository.GetRecentTransactionsByUserAsync(userId, cancellationToken);
            return transactionsQuery;
        }
    }
}
