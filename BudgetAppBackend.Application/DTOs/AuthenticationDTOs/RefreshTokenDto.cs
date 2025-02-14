namespace BudgetAppBackend.Application.DTOs.AuthenticationDTOs
{
    public class RefreshTokenDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; }

    }
}
