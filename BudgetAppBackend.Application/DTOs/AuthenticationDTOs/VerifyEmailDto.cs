using System.ComponentModel.DataAnnotations;

namespace BudgetAppBackend.Application.DTOs.AuthenticationDTOs
{
    public class VerifyEmailDto
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Code { get; set; }
    }
}
