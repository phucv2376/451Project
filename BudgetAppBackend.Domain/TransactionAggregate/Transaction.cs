using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.DomainEvents;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using BudgetAppBackend.Domain.Exceptions.TransactionExceptions;

namespace BudgetAppBackend.Domain.TransactionAggregate
{
    public sealed class Transaction : AggregateRoot<TransactionId>
    {
        public UserId UserId { get; private set; }
        public string Category { get; private set; }
        public decimal Amount { get; private set; }
        public DateTime TransactionDate { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public string Payee { get; private set; }
        public TransactionType Type { get; private set; } //New Property

        private Transaction() : base(default!) { }

        private Transaction(TransactionId id, UserId userId, string category, decimal amount, DateTime transactionDate, string payee, TransactionType type)
            : base(id)
        {
            if (amount <= 0)
                throw new TransactionAmountException("Transaction amount must be greater than zero.");
            if (string.IsNullOrWhiteSpace(payee))
                throw new TransactionPayeeException("Payee name cannot be empty.");

            UserId = userId;
            Category = category;
            Amount = amount;
            TransactionDate = transactionDate;
            CreatedDate = DateTime.UtcNow;
            Payee = payee;
            Type = type;
        }

        public static Transaction Create(UserId userId, string category, decimal amount, DateTime transactionDate, string payee, TransactionType type)
        {
            var transaction = new Transaction(TransactionId.CreateId(), userId, category, amount, transactionDate, payee, type);
            transaction.RaiseDomainEvent(new TransactionCreatedEvent(userId.Id, category, amount, transactionDate));
            return transaction;
        }

        public void UpdateTransaction(decimal newAmount, DateTime newTransactionDate, string newPayee, string category, TransactionType newType)
        {
            if (newAmount <= 0)
                throw new TransactionAmountException("Transaction amount must be greater than zero.");
            if (string.IsNullOrWhiteSpace(newPayee))
                throw new TransactionPayeeException("Payee name cannot be empty.");

            var oldAmount = Amount;
            var oldType = Type;

            Amount = newAmount;
            TransactionDate = newTransactionDate;
            Payee = newPayee;
            Type = newType;

            RaiseDomainEvent(new TransactionUpdatedEvent(UserId.Id, category, oldAmount, newAmount, TransactionDate));
        }

        public void DeleteTransaction()
        {
            RaiseDomainEvent(new TransactionDeletedEvent(UserId.Id, Category, Amount, TransactionDate));
        }
    }
}
