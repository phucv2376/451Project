using BudgetAppBackend.Application.Models.PlaidModels;
using BudgetAppBackend.Application.Service;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BudgetAppBackend.Application.Features.Plaid.ExchangePublicToken
{
    public class ExchangePublicTokenCommandHandler : IRequestHandler<ExchangePublicTokenCommand, AccessTokenResponse>
    {
        private readonly IPlaidService _plaidService;
        private readonly ILogger<ExchangePublicTokenCommandHandler> _logger;

        public ExchangePublicTokenCommandHandler(IPlaidService plaidService, ILogger<ExchangePublicTokenCommandHandler> logger)
        {
            _plaidService = plaidService;
            _logger = logger;
        }

        public async Task<AccessTokenResponse> Handle(ExchangePublicTokenCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Exchanging public token");
                return await _plaidService.ExchangePublicTokenAsync(request.PublicToken, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exchanging public token");
                throw;
            }
        }
    }
}
