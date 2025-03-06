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
        private readonly IUrlGenerator _urlGenerator;

        public GetUserTransactionsWithPaginationQueryHandler(
            ITransactionRepository transactionReadRepository,
            IUrlGenerator urlGenerator)
        {
            _transactionReadRepository = transactionReadRepository;
            _urlGenerator = urlGenerator;
        }

        public async Task<PagedResponse<TransactionDto>> Handle(
            GetUserTransactionsWithPaginationQuery request, CancellationToken cancellationToken)
        {
            if (request.UserId is null)
                throw new ArgumentException("UserId cannot be null");

            var userId = UserId.Create(request.UserId);
            var transactionsQuery = await _transactionReadRepository.GetUserTransactionsQueryAsync(userId, cancellationToken);


            var pagedResponse = new PagedResponse<TransactionDto>(transactionsQuery, request.Paging!);


            if (pagedResponse.Paging.HasNextPage)
            {
                pagedResponse.Paging.NextPageURL = _urlGenerator.GenerateUrl("api/Transaction", new
                {
                    UserId = request.UserId,
                    rowCount = request.Paging!.rowCount,
                    pageNumber = request.Paging.pagNumber + 1
                });
            }

            if (pagedResponse.Paging.HasPrevPage)
            {
                pagedResponse.Paging.PrevPageURL = _urlGenerator.GenerateUrl("api/Transaction", new
                {
                    UserId = request.UserId,
                    rowCount = request.Paging!.rowCount,
                    pageNumber = request.Paging.pagNumber - 1
                });
            }

            return pagedResponse;
        }
    }
}
