using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.TransactionAggregate;

namespace BudgetAppBackend.Application.Service
{
    public interface IAIAnalysisService
    {
        /// <summary>
        /// Analyzes spending patterns based on a collection of transactions.
        /// </summary>
        Task<string> AnalyzeSpendingPatterns(IEnumerable<Transaction> transactions);

        /// <summary>
        /// Generates budget recommendations using the provided budgets and transactions.
        /// </summary>
        Task<string> GetBudgetRecommendations(IEnumerable<Budget> budgets, IEnumerable<Transaction> transactions);
    }
}
