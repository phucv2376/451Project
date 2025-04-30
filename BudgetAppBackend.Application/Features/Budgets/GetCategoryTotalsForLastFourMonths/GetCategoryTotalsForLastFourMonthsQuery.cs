using BudgetAppBackend.Application.DTOs.BudgetDTOs;
using MediatR;

namespace BudgetAppBackend.Application.Features.Budgets.GetCategoryTotalsForLastFourMonths
{
    public class GetCategoryTotalsForLastFourMonthsQuery : IRequest<MonthlyCategoryTotalDto>
    {
        public Guid UserId { get; set; }
        
    }
}
