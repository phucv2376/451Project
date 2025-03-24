using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AiAnalysisDTOS;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.AI.GetSpendingForecast
{
    public class GetSpendingForecastQueryHandler : IRequestHandler<GetSpendingForecastQuery, DailySpendingForecastResult>
    {
        private readonly IDailySpendingForecaster _dailySpendingForecaster;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IPlaidTransactionRepository _plaidTransactionRepository;

        public GetSpendingForecastQueryHandler(
            IDailySpendingForecaster dailySpendingForecaster,
            ITransactionRepository transactionRepository,
            IPlaidTransactionRepository plaidTransactionRepository)
        {
            _dailySpendingForecaster = dailySpendingForecaster;
            _transactionRepository = transactionRepository;
            _plaidTransactionRepository = plaidTransactionRepository;
        }
        public async Task<DailySpendingForecastResult> Handle(GetSpendingForecastQuery request, CancellationToken cancellationToken)
        {
            var userId = UserId.Create(request.userId);

            var plaidTransactions = (await _plaidTransactionRepository.GetThreeMonthTransactionsByUserIdAsync(userId)) ?? Enumerable.Empty<TransactionDto>();

            if (!plaidTransactions.Any())
            {
                throw new KeyNotFoundException("No transactions to analyze");
            }

            var dailyExpenses = plaidTransactions
               .Where(t => t.Categories.FirstOrDefault() != "Payment")
               .GroupBy(t => t.TransactionDate.Date)
               .OrderBy(g => g.Key)
               .Select(g => new { Date = g.Key, Total = g.Sum(t => t.Amount) })
               .ToList();

            float[] dailyAmounts = dailyExpenses.Select(g => (float)g.Total).ToArray();
            var lastKnownDate = dailyExpenses.Last().Date;

            var forecast = await _dailySpendingForecaster.ForecastAsync(dailyAmounts, lastKnownDate, 30);

            return forecast;
        }

    }
}
