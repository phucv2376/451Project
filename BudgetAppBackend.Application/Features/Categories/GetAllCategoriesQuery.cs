using BudgetAppBackend.Application.DTOs.CategoryDTOS;
using MediatR;

namespace BudgetAppBackend.Application.Features.Categories
{
    public class GetAllCategoriesQuery : IRequest<List<CategoryDto>>
    {
    }
}
