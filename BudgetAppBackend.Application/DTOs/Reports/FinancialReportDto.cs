using BudgetAppBackend.Application.DTOs.BudgetDTOs;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;

namespace BudgetAppBackend.Application.DTOs.Reports
{
    public class FinancialReportDto
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetSavings => TotalIncome - TotalExpenses;
        public List<BudgetDto> Budgets { get; set; }
        public List<TransactionDto> RecentTransactions { get; set; }

    }
}
