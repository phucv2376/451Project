using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.DTOs.AuthenticationDTOs
{
    public class AuthResult
    {
        public bool Success { get; set; }
        public Guid? UserId { get; set; }
        public string? Token { get; internal set; }
        public string? Message { get; set; }
    }
}
