using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.DomainEvents;
using BudgetAppBackend.Domain.PlaidTransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.PlaidTransactionAggregate
{
    public sealed class PlaidTransaction : AggregateRoot<PlaidTranId>
    {

        public UserId UserId { get; private set; }
        public string PlaidTransactionId { get; private set; }
        public string AccountId { get; private set; }
        public decimal Amount { get; private set; }
        public string Name { get; private set; }
        public DateTime Date { get; private set; }
        public string? Category { get; private set; }
        public string? CategoryId { get; private set; }
        public string? MerchantName { get; private set; }
        public bool IsRemoved { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime LastModifiedAt { get; private set; }

        private PlaidTransaction() : base(default!) { }

        private PlaidTransaction(PlaidTranId id, UserId userId, string plaidTransactionId, string accountId, decimal amount, string name, DateTime date, string? category, string? categoryId, string? merchantName)
            : base(id)
        {
            UserId = userId;
            PlaidTransactionId = plaidTransactionId;
            AccountId = accountId;
            Amount = amount;
            Name = name;
            Date = date;
            Category = category;
            CategoryId = categoryId;
            MerchantName = merchantName;
            IsRemoved = false;
            CreatedAt = DateTime.UtcNow;
            LastModifiedAt = DateTime.UtcNow;
        }

        public static PlaidTransaction Create(UserId userId, 
            string plaidTransactionId, 
            string accountId, decimal amount, 
            string name, 
            DateTime date, 
            string? category, 
            string? categoryId, 
            string? merchantName)
        {
            var transactionId = PlaidTranId.CreateId();
            var plaidTransaction = new PlaidTransaction(
                transactionId, 
                userId, 
                plaidTransactionId, 
                accountId, 
                amount, 
                name, 
                date, 
                category, 
                categoryId, 
                merchantName
            );

            plaidTransaction.RaiseDomainEvent(new PlaidTransactionCreatedEvent(transactionId.Id,userId.Id, plaidTransactionId, accountId, amount, category, date));
            return plaidTransaction;
        }

        public void MarkAsRemoved()
        {
            if (!IsRemoved)
            {
                IsRemoved = true;
                LastModifiedAt = DateTime.UtcNow;

                RaiseDomainEvent(new PlaidTransactionRemovedDomainEvent(
                    Id.Id,
                    UserId.Id,
                    Amount,
                    Category,
                    Date));
            }
        }

        public void Update(decimal amount,
        string name,
        DateTime date,
        string? category,
        string? categoryId,
        string? merchantName)
        {
            var oldAmount = Amount;
            var oldCategory = Category;

            Amount = amount;
            Name = name;
            Category = category;
            CategoryId = categoryId;
            MerchantName = merchantName;
            LastModifiedAt = DateTime.UtcNow;

            if (oldAmount != Amount || oldCategory != Category)
            {
                RaiseDomainEvent(new PlaidTransactionModifiedDomainEvent(
                    Id.Id,
                    UserId.Id,
                    oldAmount,
                    Amount,
                    oldCategory,
                    Category,
                    Date)
                );
            }
        }

    }
}
