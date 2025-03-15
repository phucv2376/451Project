using BudgetAppBackend.Application.Models.PlaidModels;
using MediatR;

namespace BudgetAppBackend.Application.Features.Plaid.ExchangePublicToken;

public record ExchangePublicTokenCommand(string PublicToken) : IRequest<AccessTokenResponse>;
