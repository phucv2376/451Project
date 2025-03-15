using BudgetAppBackend.Application.Features.Plaid.CreateLinkToken;
using BudgetAppBackend.Application.Features.Plaid.ExchangePublicToken;
using BudgetAppBackend.Application.Features.Plaid.GetAccounts;
using BudgetAppBackend.Application.Features.Plaid.SyncTransactions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BudgetAppBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlaidController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PlaidController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("link-token")] //done
        public async Task<IActionResult> CreateLinkToken([FromBody] CreateLinkTokenRequest request, CancellationToken cancellationToken)
        {
            var command = new CreateLinkTokenCommand(request.ClientUserId);
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPost("exchange-token")] //done
        public async Task<IActionResult> ExchangePublicToken([FromBody] ExchangePublicTokenRequest request, CancellationToken cancellationToken)
        {
            var command = new ExchangePublicTokenCommand(request.PublicToken);
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPost("transactions/sync")] // done
        public async Task<IActionResult> SyncTransactions([FromBody] SyncTransactionsRequest request,CancellationToken cancellationToken)
        {
            
            var command = new SyncTransactionsCommand(
                request.userId,
                request.AccessToken,
                request.Cursor,
                request.Count ?? 100);

            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpGet("accounts")] // done
        public async Task<IActionResult> GetAccounts([FromQuery] GetAccountsRequest request, CancellationToken cancellationToken)
        {
            var query = new GetAccountsQuery(request.AccessToken);
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
    }

    public record CreateLinkTokenRequest(string ClientUserId);
    public record ExchangePublicTokenRequest(string PublicToken);
    public record GetAccountsRequest(string AccessToken);

    public record SyncTransactionsRequest(Guid userId,string AccessToken, string? Cursor, int? Count);
    
}
