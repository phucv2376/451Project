using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using MediatR;

namespace BudgetAppBackend.Application.Features.Transactions.GetDetailedDailyCashFlow;

public sealed record GetDetailedDailyCashFlowQuery(Guid UserId, DateTime MonthStartDate) : IRequest<IEnumerable<DetailedDailyCashFlowDto>>;
