using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.DTOs.AuthenticationDTOs;
using BudgetAppBackend.Domain.UserAggregate;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

       
        public Task<User> GetUserByEmailAsync(string Email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == Email);
            return Task.FromResult(user!);
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

        }

        public async Task Register(User addNewUser)
        {
            _context.Users.Add(addNewUser);
            await _context.SaveChangesAsync();
        }

       
    }
}
