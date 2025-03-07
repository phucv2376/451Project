using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.DomainEvents;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.TransactionAggregate
{
    public sealed class Transaction : AggregateRoot<TransactionId>
    {
        public UserId UserId { get; private set; }
        public CategoryId CategoryId { get; private set; }
        public decimal Amount { get; private set; }
        public DateTime TransactionDate { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public string Payee { get; private set; }
        public TransactionType Type { get; private set; } //New Property

        private Transaction() : base(default!) { }

        private Transaction(TransactionId id, UserId userId, CategoryId categoryId, decimal amount, DateTime transactionDate, string payee, TransactionType type)
            : base(id)
        {
            if (amount <= 0)
                throw new ArgumentException("Transaction amount must be greater than zero.");
            if (string.IsNullOrWhiteSpace(payee))
                throw new ArgumentException("Payee name cannot be empty.");

            UserId = userId;
            CategoryId = categoryId;
            Amount = amount;
            TransactionDate = transactionDate;
            CreatedDate = DateTime.UtcNow;
            Payee = payee;
            Type = type;
        }

        public static Transaction Create(UserId userId, CategoryId categoryId, decimal amount, DateTime transactionDate, string payee, TransactionType type)
        {
            var transaction = new Transaction(TransactionId.CreateId(), userId, categoryId, amount, transactionDate, payee, type);
            transaction.RaiseDomainEvent(new TransactionCreatedEvent(userId.Id, categoryId.Id, amount));
            return transaction;
        }

        public void UpdateTransaction(decimal newAmount, DateTime newTransactionDate, string newPayee, TransactionType newType)
        {
            if (newAmount <= 0)
                throw new ArgumentException("Transaction amount must be greater than zero.");
            if (string.IsNullOrWhiteSpace(newPayee))
                throw new ArgumentException("Payee name cannot be empty.");

            var oldAmount = Amount;
            var oldType = Type;

            Amount = newAmount;
            TransactionDate = newTransactionDate;
            Payee = newPayee;
            Type = newType;

            RaiseDomainEvent(new TransactionUpdatedEvent(UserId.Id, CategoryId.Id, oldAmount, newAmount));
        }

        public void DeleteTransaction()
        {
            RaiseDomainEvent(new TransactionDeletedEvent(UserId.Id, CategoryId.Id, Amount));
        }
    }
}
