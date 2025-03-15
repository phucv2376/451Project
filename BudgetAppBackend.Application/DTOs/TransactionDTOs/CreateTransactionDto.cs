namespace BudgetAppBackend.Application.DTOs.TransactionDTOs
{
    public record CreateTransactionDto(
        decimal Amount,
        DateTime TransactionDate,
        Guid UserId,
        string Category,
        string payee,
        string transactionType
    );
}
