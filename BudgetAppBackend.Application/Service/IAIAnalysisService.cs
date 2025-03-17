using BudgetAppBackend.Application.DTOs.AiAnalysisDTOS;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.TransactionAggregate;

namespace BudgetAppBackend.Application.Service
{
    public interface IAIAnalysisService
    {
        /// <summary>
        /// Analyzes spending patterns based on a collection of transactions.
        /// </summary>
        Task<QuarterlyTransactionAnalysis> AnalyzeSpendingPatternsForLastThreeMonth(IEnumerable<TransactionDto> transactions);


        Task<SpendingForecast> ForecastSpendingTrends(IEnumerable<TransactionDto> transactions);

        /// <summary>
        /// Generates budget recommendations using the provided budgets and transactions.
        /// </summary>
        Task<string> GetBudgetRecommendations(IEnumerable<Budget> budgets, IEnumerable<TransactionDto> transactions);
    }
}
