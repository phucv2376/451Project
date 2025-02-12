using System.ComponentModel.DataAnnotations;

namespace BudgetAppBackend.Application.DTOs.AuthenticationDTOs
{
    public class AddUserDto
    {
        [Required]
        public string? FirstName { get; set; }
        [Required]
        public string? LastName { get; set; }
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [RegularExpression(@"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$",
        ErrorMessage = "Email must be in lowercase.")]
        public string? Email { get; set; }
  
        [DataType(DataType.Password)]
        [Required(ErrorMessage = "Password is required.")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
        public string? Password { get; set; }
        [Required]
        [DataType(DataType.Password)]
        [Compare("Password")]
        public string? Confirmpassword { get; set; }
    }
}
