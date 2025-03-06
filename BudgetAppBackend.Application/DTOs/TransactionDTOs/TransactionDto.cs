namespace BudgetAppBackend.Application.DTOs.TransactionDTOs
{
    public record TransactionDto(
        Guid TransactionId,
        decimal Amount,
        DateTime TransactionDate,
        Guid CategoryId,
        string CategoryName,
        string payee
    );
}
