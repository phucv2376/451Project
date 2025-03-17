namespace BudgetAppBackend.Application.DTOs.TransactionDTOs
{
    public class TransactionDto
    {
        public TransactionDto(Guid id, DateTime date, decimal amount, string payee, string category)
        {
            TransactionId = id;
            TransactionDate = date;
            Amount = amount;
            Payee = payee;
            Category = category;
        }

        public Guid TransactionId { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Category { get; set; }
        public string Payee { get; set; }
    }
}
