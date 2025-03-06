using BudgetAppBackend.Application.DTOs.CategoryDTOS;
using BudgetAppBackend.Application.Features.Categories;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BudgetAppBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ISender _sender;

        public CategoryController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet("list-all-categories")]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories()
        {
            var result = await _sender.Send(new GetAllCategoriesQuery());
            return Ok(result);
        }
    }
}
