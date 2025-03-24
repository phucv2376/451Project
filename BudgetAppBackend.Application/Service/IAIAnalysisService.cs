using BudgetAppBackend.Application.DTOs.AiAnalysisDTOS;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Domain.BudgetAggregate;

namespace BudgetAppBackend.Application.Service
{
    public interface IAIAnalysisService
    {

        Task<QuarterlyTransactionAnalysis> AnalyzeSpendingPatternsForLastThreeMonth(IEnumerable<TransactionDto> transactions);

        Task<string> GetBudgetRecommendations(IEnumerable<Budget> budgets, IEnumerable<TransactionDto> transactions);
    }
}
