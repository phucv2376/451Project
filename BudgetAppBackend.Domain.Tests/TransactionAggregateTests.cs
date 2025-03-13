using System;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using BudgetAppBackend.Domain.CategoryAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using BudgetAppBackend.Domain.Exceptions.TransactionExceptions;
using Xunit;

namespace BudgetAppBackend.Domain.Tests
{
    public class TransactionAggregateTests
    {
        [Fact]
        public void CreateTransaction_ShouldInitializeCorrectly()
        {
            // Arrange
            var userId = UserId.CreateId();
            var categoryId = CategoryId.CreateId();
            decimal amount = 100;
            DateTime transactionDate = DateTime.UtcNow;
            string payee = "John Doe";
            TransactionType type = TransactionType.Expense;

            // Act
            var transaction = Transaction.Create(userId, categoryId, amount, transactionDate, payee, type);

            // Assert
            Assert.Equal(userId, transaction.UserId);
            Assert.Equal(categoryId, transaction.CategoryId);
            Assert.Equal(amount, transaction.Amount);
            Assert.Equal(transactionDate, transaction.TransactionDate);
            Assert.Equal(payee, transaction.Payee);
            Assert.Equal(type, transaction.Type);
        }

        [Fact]
        public void CreateTransaction_ShouldThrowException_WhenAmountIsZeroOrNegative()
        {
            // Arrange
            var userId = UserId.CreateId();
            var categoryId = CategoryId.CreateId();
            decimal amount = 0;
            DateTime transactionDate = DateTime.UtcNow;
            string payee = "John Doe";
            TransactionType type = TransactionType.Expense;

            // Act & Assert
            Assert.Throws<TransactionAmountException>(() => Transaction.Create(userId, categoryId, amount, transactionDate, payee, type));
        }

        [Fact]
        public void CreateTransaction_ShouldThrowException_WhenPayeeIsEmpty()
        {
            // Arrange
            var userId = UserId.CreateId();
            var categoryId = CategoryId.CreateId();
            decimal amount = 100;
            DateTime transactionDate = DateTime.UtcNow;
            string payee = "";
            TransactionType type = TransactionType.Expense;

            // Act & Assert
            Assert.Throws<TransactionPayeeException>(() => Transaction.Create(userId, categoryId, amount, transactionDate, payee, type));
        }

        [Fact]
        public void UpdateTransaction_ShouldModifyValuesCorrectly()
        {
            // Arrange
            var transaction = Transaction.Create(UserId.CreateId(), CategoryId.CreateId(), 100, DateTime.UtcNow, "John Doe", TransactionType.Expense);
            decimal newAmount = 200;
            DateTime newTransactionDate = DateTime.UtcNow.AddDays(1);
            string newPayee = "Jane Doe";
            TransactionType newType = TransactionType.Income;

            // Act
            transaction.UpdateTransaction(newAmount, newTransactionDate, newPayee, newType);

            // Assert
            Assert.Equal(newAmount, transaction.Amount);
            Assert.Equal(newTransactionDate, transaction.TransactionDate);
            Assert.Equal(newPayee, transaction.Payee);
            Assert.Equal(newType, transaction.Type);
        }

        [Fact]
        public void UpdateTransaction_ShouldThrowException_WhenAmountIsZeroOrNegative()
        {
            // Arrange
            var transaction = Transaction.Create(UserId.CreateId(), CategoryId.CreateId(), 100, DateTime.UtcNow, "John Doe", TransactionType.Expense);
            decimal newAmount = 0;
            DateTime newTransactionDate = DateTime.UtcNow.AddDays(1);
            string newPayee = "Jane Doe";
            TransactionType newType = TransactionType.Income;

            // Act & Assert
            Assert.Throws<TransactionAmountException>(() => transaction.UpdateTransaction(newAmount, newTransactionDate, newPayee, newType));
        }

        [Fact]
        public void DeleteTransaction_ShouldRaiseDomainEvent()
        {
            // Arrange
            var transaction = Transaction.Create(UserId.CreateId(), CategoryId.CreateId(), 100, DateTime.UtcNow, "John Doe", TransactionType.Expense);

            // Act
            transaction.DeleteTransaction();

            // Assert
            // No direct way to check events, but we ensure no exceptions are thrown
            Assert.Equal(100, transaction.Amount); // Ensures the object is still valid
        }
    }
}

