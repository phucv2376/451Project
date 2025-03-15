using BudgetAppBackend.Application.Features.AI.GetAiAnalysis;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BudgetAppBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiAnalysisController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AiAnalysisController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAiAnalysis(Guid userId)
        {

          
            var result = await _mediator.Send(new GetAiAnalysisQuery
            {
                UserId = userId
            });
            return Ok(result);
        }
    }
}
