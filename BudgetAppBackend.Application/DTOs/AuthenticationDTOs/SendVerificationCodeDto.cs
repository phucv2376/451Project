using System.ComponentModel.DataAnnotations;

namespace BudgetAppBackend.Application.DTOs.AuthenticationDTOs
{
    public class SendVerificationCodeDto
    {
        [Required]
        public string Email { get; set; }
    }
}
