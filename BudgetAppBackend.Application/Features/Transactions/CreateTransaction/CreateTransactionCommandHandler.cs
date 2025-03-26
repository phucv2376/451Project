using AutoMapper;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.TransactionAggregate;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
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
            var dto = request.createTransactionDto;

            var userId = UserId.Create(dto.UserId);

            if (!Enum.TryParse<TransactionType>(dto.transactionType, true, out var transactionType))
                throw new ArgumentException($"Invalid transaction type: {dto.transactionType}");

            var newTransaction = Transaction.Create(
                userId,
                dto.Categories,
                dto.Amount,
                dto.TransactionDate,
                dto.payee,
                transactionType
            );

            await _transactionRepository.AddAsync(newTransaction, cancellationToken);

            return Unit.Value;
        }

    }
}
