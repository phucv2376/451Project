using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.BudgetDTOs;
using MediatR;

namespace BudgetAppBackend.Application.Features.Budgets.GetCategoryTotalsForLastFourMonths
{
    public class GetCategoryTotalsForLastFourMonthsQueryHandler : IRequestHandler<GetCategoryTotalsForLastFourMonthsQuery, MonthlyCategoryTotalDto>
    {
        private readonly IBudgetRepository _budgetRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IPlaidTransactionRepository _laidTransactionRepository;

        public GetCategoryTotalsForLastFourMonthsQueryHandler(IBudgetRepository budgetRepository, ITransactionRepository transactionRepository, IPlaidTransactionRepository laidTransactionRepository)
        {
            _budgetRepository = budgetRepository;
            _transactionRepository = transactionRepository;
            _laidTransactionRepository = laidTransactionRepository;
        }

        public Task<MonthlyCategoryTotalDto> Handle(GetCategoryTotalsForLastFourMonthsQuery request, CancellationToken cancellationToken)
        {
            //var budget = _budgetRepository.GetByCategoryAsync(request, request.UserId, request.Date, cancellationToken);
            throw new NotImplementedException();
        }
    }
}
