using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.PagingsDTOs;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetUserTransactionsWithPagination
{
    public class GetUserTransactionsWithPaginationQueryHandler
        : IRequestHandler<GetUserTransactionsWithPaginationQuery, PagedResponse<TransactionDto>>
    {
        private readonly ITransactionRepository _transactionReadRepository;
        private readonly IPlaidTransactionRepository _plaidTransactionRepository;
        private readonly IUrlGenerator _urlGenerator;

        public GetUserTransactionsWithPaginationQueryHandler(
            ITransactionRepository transactionReadRepository,
            IUrlGenerator urlGenerator,
            IPlaidTransactionRepository plaidTransactionRepository)
        {
            _transactionReadRepository = transactionReadRepository;
            _urlGenerator = urlGenerator;
            _plaidTransactionRepository = plaidTransactionRepository;
        }

        public async Task<PagedResponse<TransactionDto>> Handle(
            GetUserTransactionsWithPaginationQuery request, CancellationToken cancellationToken)
        {
            if (request.UserId is null)
                throw new ArgumentException("UserId cannot be null");

            var userId = UserId.Create(request.UserId);
            var manualTransactions = await _transactionReadRepository.GetUserTransactionsQueryAsync(userId, cancellationToken);
            var plaidTransactions = await _plaidTransactionRepository.GetUserTransactionsQueryAsync(userId, cancellationToken);


            var manualTransactionsList = manualTransactions.ToList();
            var plaidTransactionsList = plaidTransactions.ToList();

            var allTransactions = manualTransactionsList.Concat(plaidTransactionsList)
                                         .OrderByDescending(t => t.TransactionDate)
                                         .AsQueryable();

            var pagedResponse = new PagedResponse<TransactionDto>(allTransactions, request.Paging!);


            if (pagedResponse.Paging.HasNextPage)
            {
                pagedResponse.Paging.NextPageURL = _urlGenerator.GenerateUrl("api/Transaction", new
                {
                    UserId = request.UserId,
                    rowCount = request.Paging!.rowCount,
                    pageNumber = request.Paging.pageNumber + 1
                });
            }

            if (pagedResponse.Paging.HasPrevPage)
            {
                pagedResponse.Paging.PrevPageURL = _urlGenerator.GenerateUrl("api/Transaction", new
                {
                    UserId = request.UserId,
                    rowCount = request.Paging!.rowCount,
                    pageNumber = request.Paging.pageNumber - 1
                });
            }

            return pagedResponse;
        }
    }
}
