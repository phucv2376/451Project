using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.CategoryDTOS;
using MediatR;

namespace BudgetAppBackend.Application.Features.Categories
{
    public class GetAllCategoriesQueryHandler
    {
        public class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, List<CategoryDto>>
        {
            private readonly ICategoryRepository _categoryRepository;

            public GetAllCategoriesHandler(ICategoryRepository categoryRepository)
            {
                _categoryRepository = categoryRepository;
            }

            public async Task<List<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
            {
                return await _categoryRepository.GetAllCategoriesAsync();
            }
        }
    }
}
