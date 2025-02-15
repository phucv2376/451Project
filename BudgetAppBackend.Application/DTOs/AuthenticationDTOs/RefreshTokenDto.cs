namespace BudgetAppBackend.Application.DTOs.AuthenticationDTOs
{
    public class RefreshTokenDto
    {
        public string Token { get; init; } = string.Empty;
        public string Email { get; init; }

    }
}
