using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.CategoryDTOS;
using Microsoft.EntityFrameworkCore;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id.Id,
                    Name = c.Name
                })
                .ToListAsync();
        }
    }
}
