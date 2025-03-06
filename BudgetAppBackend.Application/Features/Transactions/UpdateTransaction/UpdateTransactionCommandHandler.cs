using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.TransactionAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.UpdateTransaction
{
    public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, Unit>
    {
        private readonly ITransactionRepository _transactionRepository;    
        public UpdateTransactionCommandHandler(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }
        public async Task<Unit> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
        {
            var transactionId = TransactionId.Create(request.UpdateTransactionDto.TransactionId);
            var transaction = await _transactionRepository.GetByIdAsync(transactionId, cancellationToken);
            if (transaction is null)
            {
                throw new KeyNotFoundException("Transaction not found.");
            }
            if (transaction.UserId.Id != request.UpdateTransactionDto.UserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this transaction.");
            }
            transaction.UpdateTransaction(
                request.UpdateTransactionDto.Amount,
                request.UpdateTransactionDto.TransactionDate,
                request.UpdateTransactionDto.payee,
                Enum.Parse<TransactionType>(request.UpdateTransactionDto.transactionType)
            );
            await _transactionRepository.UpdateAsync(transaction, cancellationToken);
            return Unit.Value;
        }
    }
}
