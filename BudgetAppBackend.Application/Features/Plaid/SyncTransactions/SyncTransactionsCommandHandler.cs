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
                string itemId = null!;
                PlaidSyncCursor savedCursor = null!;
                var userId = UserId.Create(request.userId);


                // Initial sync to get the Item ID if we don't already have it
                var initialSync = await _plaidService.SyncTransactionsAsync(
                    request.userId,
                    request.AccessToken,
                    null,
                    1, // Minimal data to just get the ItemID
                    cancellationToken);

                itemId = initialSync.ItemId!;

                if (string.IsNullOrEmpty(itemId))
                {
                    _logger.LogWarning("Could not retrieve Item ID for access token. Proceeding with access token only sync.");
                }

                // Get the current cursor using a prioritization strategy:
                // 1. Use provided cursor if available
                // 2. Try to find by ItemID if we have it (handles reconnection scenarios)
                // 3. Fall back to finding by AccessToken (original flow)
                var cursor = request.Cursor;
                if (cursor == null)
                {
                    if (!string.IsNullOrEmpty(itemId))
                    {
                        // Try to get cursor by ItemID first (for reconnection scenarios)
                        savedCursor = await _cursorRepository.GetCursorByItemIdAsync(userId, itemId);
                        if (savedCursor != null)
                        {
                            _logger.LogInformation("Found existing cursor by Item ID {ItemId}. User has likely reconnected with a new access token.", itemId);

                            // Update the access token for this item if it's different
                            if (savedCursor.AccessToken != request.AccessToken)
                            {
                                savedCursor.UpdateAccessToken(request.AccessToken);
                                await _cursorRepository.SaveCursorAsync(savedCursor);
                                _logger.LogInformation("Updated access token for Item ID {ItemId}", itemId);
                            }
                        }
                    }

                    // If we didn't find by ItemID or don't have an ItemID, try by access token
                    if (savedCursor == null)
                    {
                        savedCursor = await _cursorRepository.GetLastCursorAsync(userId, request.AccessToken);
                    }

                    cursor = savedCursor?.Cursor;
                }

                // Get transactions from Plaid with the cursor we found
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

                // Ensure we have the Item ID from the sync response
                itemId = syncResponse.ItemId ?? itemId;

                if (string.IsNullOrEmpty(itemId))
                {
                    _logger.LogWarning("No Item ID available after sync for user {UserId}. Using access token only.", request.userId);
                }


                // Update the sync cursor
                var newCursor = PlaidSyncCursor.Create(
                    UserId.Create(request.userId),
                    request.AccessToken,
                    itemId ?? "unknown",
                    syncResponse.NextCursor);

                await _cursorRepository.SaveCursorAsync(newCursor);
                _logger.LogInformation("Updated sync cursor for user {UserId}, Item ID {ItemId}", request.userId, itemId);

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