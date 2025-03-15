using BudgetAppBackend.Application.Models.PlaidModels;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using MediatR;
using Microsoft.Extensions.Logging;
using BudgetAppBackend.Domain.PlaidTransactionAggregate;
using BudgetAppBackend.Domain.PlaidTransactionAggregate.Entities;

namespace BudgetAppBackend.Application.Features.Plaid.SyncTransactions
{
    public class SyncTransactionsCommandHandler : IRequestHandler<SyncTransactionsCommand, TransactionsSyncResponse>
    {
        private readonly IPlaidService _plaidService;
        private readonly IPlaidTransactionRepository _transactionRepository;
        private readonly IPlaidSyncCursorRepository _cursorRepository;
        private readonly ILogger<SyncTransactionsCommandHandler> _logger;

        public SyncTransactionsCommandHandler(
            IPlaidService plaidService,
            IPlaidTransactionRepository transactionRepository,
            IPlaidSyncCursorRepository cursorRepository,
            ILogger<SyncTransactionsCommandHandler> logger)
        {
            _plaidService = plaidService;
            _transactionRepository = transactionRepository;
            _cursorRepository = cursorRepository;
            _logger = logger;
        }

        public async Task<TransactionsSyncResponse> Handle(
            SyncTransactionsCommand request,
            CancellationToken cancellationToken)
        {
            try
            {
                // Get the current cursor if not provided
                var cursor = request.Cursor;
                if (cursor == null)
                {
                    var savedCursor = await _cursorRepository.GetLastCursorAsync(
                        UserId.Create(request.userId),
                        request.AccessToken);
                    cursor = savedCursor?.Cursor;
                }

                // Get transactions from Plaid
                var syncResponse = await _plaidService.SyncTransactionsAsync(
                    request.userId,
                    request.AccessToken,
                    cursor,
                    request.Count,
                    cancellationToken);

                // Process added transactions
                if (syncResponse.Added.Any())
                {
                    var addedEntities = syncResponse.Added.Select(CreateDomainEntity).ToList();
                    await _transactionRepository.AddTransactionsAsync(addedEntities);
                }

                // Process modified transactions
                if (syncResponse.Modified.Any())
                {
                    var modifiedEntitiesTasks = syncResponse.Modified.Select(UpdateDomainEntity).ToList();
                    var modifiedEntities = await Task.WhenAll(modifiedEntitiesTasks);
                    await _transactionRepository.UpdateTransactionsAsync(modifiedEntities);
                }

                // Process removed transactions
                if (syncResponse.Removed.Any())
                {
                    var removedIds = syncResponse.Removed.Select(t => t.TransactionId).ToList();
                    await _transactionRepository.MarkTransactionsAsRemovedAsync(removedIds);
                }

                // Update the sync cursor
                var newCursor = PlaidSyncCursor.Create(
                    UserId.Create(request.userId),
                    request.AccessToken,
                    syncResponse.NextCursor);

                await _cursorRepository.SaveCursorAsync(newCursor);

                return syncResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing transactions for user {UserId}", request.userId);
                throw;
            }
        }

        private static PlaidTransaction CreateDomainEntity(PlaidTransactionDto dto)
        {
            return PlaidTransaction.Create(
                UserId.Create(dto.userId),
                dto.PlaidTransactionId,
                dto.AccountId,
                Math.Abs(dto.Amount),
                dto.Name,
                dto.Date,
                dto.Category,
                dto.CategoryId,
                dto.MerchantName);
        }

        private async Task<PlaidTransaction> UpdateDomainEntity(PlaidTransactionDto dto)
        {
            var existingTransaction = await _transactionRepository.GetByPlaidIdAsync(dto.PlaidTransactionId);
            if (existingTransaction == null)
            {
                throw new InvalidOperationException($"Cannot update non-existent transaction with ID {dto.PlaidTransactionId}");
            }

            existingTransaction.Update(
                Math.Abs(dto.Amount),
                dto.Name,
                dto.Date,
                dto.Category,
                dto.CategoryId,
                dto.MerchantName);

            return existingTransaction;
        }

    }
}