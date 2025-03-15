using BudgetAppBackend.Domain.BudgetAggregate.ValueObjects;
using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.DomainEvents;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using BudgetAppBackend.Domain.Exceptions.BudgetExceptions;
using System.Text.Json.Serialization;
using BudgetAppBackend.Domain.PlaidTransactionAggregate;

namespace BudgetAppBackend.Domain.BudgetAggregate
{
    public sealed class Budget : AggregateRoot<BudgetId>
    {
        public string Title { get; private set; }
        public decimal TotalAmount { get; private set; }
        public UserId UserId { get; private set; }
        public string Category { get; private set; }
        public bool IsActive { get; private set; } = true;
        public DateTime CreatedDate { get; private set; }
        private decimal _spentAmount;

        public decimal SpendAmount => _spentAmount;

        private Budget() : base(default!) { } // For EF Core

        [JsonConstructor]
        private Budget(BudgetId id, UserId userId, string title, decimal totalAmount, string category, DateTime createdDate)
            : base(id)
        {
            ValidateTitle(title);
            ValidateAmount(totalAmount);

            UserId = userId;
            Title = title;
            TotalAmount = totalAmount;
            Category = category;
            CreatedDate = createdDate;
            _spentAmount = 0;
        }

        public static Budget Create(UserId userId, string title, decimal totalAmount, string category, DateTime createdDate)
        {
            return new Budget(BudgetId.CreateId(), userId, title, totalAmount, category, createdDate);
        }

        public void ApplyTransaction(decimal amount)
        {
            ValidateAmount(amount);
            _spentAmount += amount;

            if (_spentAmount > TotalAmount)
            {
                RaiseDomainEvent(new BudgetExceededEvent(UserId.Id, Id.Id, Category, _spentAmount, TotalAmount));
            }
        }

        public void RollbackTransaction(decimal amount)
        {
            ValidateAmount(amount);
            if (amount > _spentAmount)
                throw new BudgetRollbackException(amount, _spentAmount);

            _spentAmount -= amount;
        }

        public decimal GetRemainingBalance() => TotalAmount - _spentAmount;

        public void UpdateTitle(string newTitle)
        {
            ValidateTitle(newTitle);
            Title = newTitle;
        }

        public void UpdateTotalAmount(decimal newTotalAmount)
        {
            ValidateAmount(newTotalAmount);
            if (newTotalAmount < _spentAmount)
                throw new BudgetDecreaseAmountException(newTotalAmount, _spentAmount);

            TotalAmount = newTotalAmount;
        }

        public bool HasExceededBudget() => _spentAmount > TotalAmount;

        public void DeactivateBudget() => IsActive = false;

        public void ResetSpentAmount() => _spentAmount = 0;

        public void ResetForNewMonth()
        {
            _spentAmount = 0;
            CreatedDate = DateTime.UtcNow;
        }

        public void ApplyPastTransactions(IEnumerable<Transaction> transactions)
        {
            foreach (var transaction in transactions)
            {
                if (transaction.TransactionDate.Month == CreatedDate.Month &&
                    transaction.TransactionDate.Year == CreatedDate.Year &&
                    transaction.Category != null &&
                    transaction.Category.Contains(Category, StringComparison.OrdinalIgnoreCase))
                {
                    ApplyTransaction(transaction.Amount);
                }
            }
        }

        public void ApplyPastPlaidTransactions(IEnumerable<PlaidTransaction> plaidTransactions)
        {
            foreach (var plaidTransaction in plaidTransactions)
            {

                if (plaidTransaction.Date.Month == CreatedDate.Month &&
                    plaidTransaction.Date.Year == CreatedDate.Year &&
                    !string.IsNullOrWhiteSpace(plaidTransaction.Category) &&
                    plaidTransaction.Category.Contains(Category, StringComparison.OrdinalIgnoreCase))
                {
                    ApplyTransaction(plaidTransaction.Amount);
                }
            }
        }


        private void ValidateTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new BudgetInvalidTitleException(title);
        }

        private void ValidateAmount(decimal amount)
        {
            if (amount <= 0)
                throw new BudgetInvalidAmountException(amount, "Amount must be greater than zero.");
        }
    }
}
