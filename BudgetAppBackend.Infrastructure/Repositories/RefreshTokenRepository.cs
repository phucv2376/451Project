using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Domain.UserAggregate.Entities;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace BudgetAppBackend.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _context;

        public RefreshTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task DeleteAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Remove(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetByUserIdAsync(UserId userId)
        {
            bool hasTokens = await _context.RefreshTokens.AnyAsync();

            if (!hasTokens)
            {
                return null;
            }

            var result = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(rt => rt.CreatedAt)
                .FirstOrDefaultAsync();

            return result;
        }

        public async Task SaveAsync(RefreshToken refreshToken)
        {
            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAndSaveNewAsync(RefreshToken oldToken, RefreshToken newToken)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.RefreshTokens.Update(oldToken);
                await _context.RefreshTokens.AddAsync(newToken);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Update(refreshToken);
            await _context.SaveChangesAsync();
        }
    }
}
