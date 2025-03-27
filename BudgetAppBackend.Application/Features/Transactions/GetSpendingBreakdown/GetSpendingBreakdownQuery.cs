using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetSpendingBreakdown;

public sealed record GetSpendingBreakdownQuery(Guid UserId) : IRequest<IEnumerable<CategoryTotalDto>>;