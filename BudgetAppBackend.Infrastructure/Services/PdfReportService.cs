using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.Reports;

namespace BudgetAppBackend.Infrastructure.Services
{
    public class PdfReportService : IPdfReportService
    {
        public byte[] GenerateFinancialReport(FinancialReportDto reportData)
        {
            throw new NotImplementedException();
        }
    }
}
