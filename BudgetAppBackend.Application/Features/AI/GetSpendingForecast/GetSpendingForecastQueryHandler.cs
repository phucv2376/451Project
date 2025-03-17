using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AiAnalysisDTOS;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.AI.GetSpendingForecast
{
    public class GetSpendingForecastQueryHandler : IRequestHandler<GetSpendingForecastQuery, SpendingForecast>
    {
        private readonly IAIAnalysisService _aiService;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IPlaidTransactionRepository _plaidTransactionRepository;

        public GetSpendingForecastQueryHandler(
            IAIAnalysisService aiService,
            ITransactionRepository transactionRepository,
            IPlaidTransactionRepository plaidTransactionRepository)
        {
            _aiService = aiService;
            _transactionRepository = transactionRepository;
            _plaidTransactionRepository = plaidTransactionRepository;
        }
        public async Task<SpendingForecast> Handle(GetSpendingForecastQuery request, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(request.userId);

            //var manualTransactions = (await _transactionRepository.GetThreeMonthTransactionsByUserIdAsync(userId)) ?? Enumerable.Empty<TransactionDto>();
            var plaidTransactions = (await _plaidTransactionRepository.GetThreeMonthTransactionsByUserIdAsync(userId)) ?? Enumerable.Empty<TransactionDto>();

            //var transactions = manualTransactions.Concat(plaidTransactions);
            if (!plaidTransactions.Any())
            {
                throw new KeyNotFoundException("No transactions to analyze");
            }

            var ForecastSpendingTrends = await _aiService.ForecastSpendingTrends(plaidTransactions);

            return ForecastSpendingTrends;
        }
    }
}
