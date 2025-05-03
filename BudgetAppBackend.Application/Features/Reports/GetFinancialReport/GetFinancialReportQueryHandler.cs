using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Reports.GetFinancialReport
{
    public class GetFinancialReportQueryHandler : IRequestHandler<GetFinancialReportQuery, byte[]>
    {
        private readonly ITransactionRepository _transactionRepo;
        private readonly IPlaidTransactionRepository _plaidTransactionRepo;
        private readonly IBudgetRepository _budgetRepo;
        private readonly IPdfReportService _pdfService;

        public GetFinancialReportQueryHandler(
            ITransactionRepository transactionRepo,
            IPlaidTransactionRepository plaidTransactionRepo,
            IBudgetRepository budgetRepo,
            IPdfReportService pdfService)
        {
            _transactionRepo = transactionRepo;
            _plaidTransactionRepo = plaidTransactionRepo;
            _budgetRepo = budgetRepo;
            _pdfService = pdfService;
        }
        public async Task<byte[]> Handle(GetFinancialReportQuery request, CancellationToken cancellationToken)
        {

            // Calculate 30-day window
            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;

            // Fetch transactions
            var transactions = await _transactionRepo.GetUserTransactionsByDateRangeAsync(request.UserId, startDate, false, cancellationToken);

            var plaidTransactions = await _plaidTransactionRepo.GetUserTransactionsAsync(request.UserId, startDate, endDate);

            // Calculate totals
            
            throw new NotImplementedException();
        }
    }
}
