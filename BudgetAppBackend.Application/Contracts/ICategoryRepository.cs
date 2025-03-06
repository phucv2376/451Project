using BudgetAppBackend.Application.DTOs.CategoryDTOS;

namespace BudgetAppBackend.Application.Contracts
{
    public interface ICategoryRepository
    {
        Task<List<CategoryDto>> GetAllCategoriesAsync();
    }
}
