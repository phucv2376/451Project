using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.UserAggregate;
using Microsoft.EntityFrameworkCore;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

       
        public async Task<User> GetUserByEmailAsync(string Email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == Email);
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

        }

        public async Task Register(User addNewUser)
        {
            await _context.Users.AddAsync(addNewUser);
            await _context.SaveChangesAsync();
        }


    }
}
