  using FluentValidation;

namespace BudgetAppBackend.Application.Features.Transactions.CreateTransaction
{
    public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
    {
        public CreateTransactionCommandValidator() { 


            RuleFor(x => x.createTransactionDto.Amount)
                .NotEmpty().WithMessage("Amount is required. Please enter the amount.")
                .GreaterThan(0).WithMessage("Amount must be greater than 0.");
            RuleFor(x => x.createTransactionDto.TransactionDate)
                .NotEmpty().WithMessage("Transaction date is required. Please enter the transaction date.");
            
        }
    }
}
