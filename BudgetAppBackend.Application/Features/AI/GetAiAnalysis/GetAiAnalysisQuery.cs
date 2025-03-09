using BudgetAppBackend.Application.DTOs.AIDTOS;
using MediatR;

namespace BudgetAppBackend.Application.Features.AI.GetAiAnalysis
{
    public class GetAiAnalysisQuery : IRequest<AiAnalysisResult>
    {
        public Guid UserId { get; set; }
    }
}
