namespace BudgetAppBackend.Application.DTOs.TransactionDTOs
{
    public record TransactionDto(
        Guid TransactionId,
        decimal Amount,
        DateTime TransactionDate,
        string Category,
        string payee
    );
}
