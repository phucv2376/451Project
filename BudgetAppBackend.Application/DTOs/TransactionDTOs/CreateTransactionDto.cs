namespace BudgetAppBackend.Application.DTOs.TransactionDTOs
{
    public record CreateTransactionDto(
        decimal Amount,
        DateTime TransactionDate,
        Guid UserId,
        Guid CategoryId,
        string payee,
        string transactionType
    );
}
