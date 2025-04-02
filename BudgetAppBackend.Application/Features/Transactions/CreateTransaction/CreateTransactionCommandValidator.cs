  using FluentValidation;

namespace BudgetAppBackend.Application.Features.Transactions.CreateTransaction
{
    public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
    {
        public CreateTransactionCommandValidator() { 


            RuleFor(x => x.createTransactionDto.Amount)
                .NotEmpty().WithMessage("Amount is required. Please enter the amount.");
            RuleFor(x => x.createTransactionDto.TransactionDate)
                .NotEmpty().WithMessage("Transaction date is required. Please enter the transaction date.");
            
        }
    }
}
