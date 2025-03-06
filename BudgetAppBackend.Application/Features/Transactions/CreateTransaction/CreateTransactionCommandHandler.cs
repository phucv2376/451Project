using AutoMapper;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.TransactionAggregate;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.CreateTransaction
{
    public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, Unit>
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IMapper _mapper;
        public CreateTransactionCommandHandler(ITransactionRepository transactionRepository, IMapper mapper)
        {
            _transactionRepository = transactionRepository;
            _mapper = mapper;
        }
        public async Task<Unit> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
        {
            var mappedTransaction = _mapper.Map<Transaction>(request.createTransactionDto);
            var newTransaction = Transaction.Create(
                mappedTransaction.UserId,
                mappedTransaction.CategoryId,
                mappedTransaction.Amount,
                mappedTransaction.TransactionDate,
                mappedTransaction.Payee,
                mappedTransaction.Type
            );
            await _transactionRepository.AddAsync(newTransaction, cancellationToken);

            return Unit.Value;
        }
    }
}
