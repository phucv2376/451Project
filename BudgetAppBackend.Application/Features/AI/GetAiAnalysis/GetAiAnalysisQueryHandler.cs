using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AIDTOS;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.AI.GetAiAnalysis
{
    public class GetAiAnalysisQueryHandler : IRequestHandler<GetAiAnalysisQuery, AiAnalysisResult>
    {
        private readonly IAIAnalysisService _aiService;
        private readonly IBudgetRepository _budgetRepository;
        private readonly ITransactionRepository _transactionRepository;

        public GetAiAnalysisQueryHandler(IAIAnalysisService aiService, IBudgetRepository budgetRepository, ITransactionRepository transactionRepository)
        {
            _aiService = aiService;
            _budgetRepository = budgetRepository;
            _transactionRepository = transactionRepository;
        }
        public async Task<AiAnalysisResult> Handle(GetAiAnalysisQuery request, CancellationToken cancellationToken)
        {
            var userId =  UserId.Create(request.UserId);
            //var budgets = await _budgetRepository.GetBudgetsByUserIdAsync(userId);
            var transactions = await _transactionRepository.GetTransactionsByUserIdAsync(userId);

            var spendingAnalysis = await _aiService.AnalyzeSpendingPatterns(transactions);

            //var budgetRecommendations = await _aiService.GetBudgetRecommendations(budgets, transactions);


            return new AiAnalysisResult
            {
                SpendingAnalysis = spendingAnalysis,
            };
        }
    }
}
