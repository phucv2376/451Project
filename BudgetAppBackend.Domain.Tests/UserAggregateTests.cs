using BudgetAppBackend.Domain.UserAggregate;

namespace BudgetAppBackend.Domain.Tests
{
    public class UserAggregateTests
    {
        [Fact]
        public void CreateNewUser_ShouldCreateUser_WithValidInputs()
        {
            // Arrange
            string firstName = "John";
            string lastName = "Doe";
            string email = "john.doe@example.com";
            string password = "Password123!";

            // Act
            var user = User.CreateNewUser(firstName, lastName, email, password);

            // Assert
            Assert.NotNull(user);
            Assert.Equal(firstName, user.FirstName);
            Assert.Equal(lastName, user.LastName);
            Assert.Equal(email, user.Email);
            Assert.False(user.IsEmailVerified);
        }

        [Fact]
        public void ChangePassword_ShouldUpdatePasswordHash()
        {
            // Arrange
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", "OldPassword123!");
            string newPassword = "NewSecurePassword!";
            var oldPasswordHash = user.PasswordHash;

            // Act
            user.ChangePassword(newPassword);

            // Assert
            Assert.NotEqual(oldPasswordHash, user.PasswordHash);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
        {
            // Arrange
            string password = "SecurePassword123!";
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", password);

            // Act
            bool result = user.VerifyPassword(password);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
        {
            // Arrange
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", "SecurePassword123!");

            // Act
            bool result = user.VerifyPassword("WrongPassword!");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void SetEmailVerificationCode_ShouldRaiseEvent()
        {
            // Arrange
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", "SecurePassword123!");
            string verificationCode = "123456";
            DateTime expiry = DateTime.UtcNow.AddMinutes(10);

            // Act
            user.SetEmailVerificationCode(verificationCode, expiry, user.FirstName, user.LastName, user.Email);

            // Assert
            Assert.Equal(verificationCode, user.EmailVerificationCode);
            Assert.Equal(expiry, user.EmailVerificationCodeExpiry);
        }

        [Fact]
        public void VerifyEmail_ShouldReturnTrue_ForValidCodeAndNotExpired()
        {
            // Arrange
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", "SecurePassword123!");
            string verificationCode = "123456";
            DateTime expiry = DateTime.UtcNow.AddMinutes(10);
            user.SetEmailVerificationCode(verificationCode, expiry, user.FirstName, user.LastName, user.Email);

            // Act
            bool result = user.VerifyEmail(verificationCode);

            // Assert
            Assert.True(result);
            Assert.True(user.IsEmailVerified);
            Assert.Null(user.EmailVerificationCode);
            Assert.Null(user.EmailVerificationCodeExpiry);
        }

        [Fact]
        public void VerifyEmail_ShouldReturnFalse_ForInvalidCode()
        {
            // Arrange
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", "SecurePassword123!");
            user.SetEmailVerificationCode("123456", DateTime.UtcNow.AddMinutes(10), user.FirstName, user.LastName, user.Email);

            // Act
            bool result = user.VerifyEmail("654321");

            // Assert
            Assert.False(result);
            Assert.False(user.IsEmailVerified);
        }

        [Fact]
        public void VerifyEmail_ShouldReturnFalse_ForExpiredCode()
        {
            // Arrange
            var user = User.CreateNewUser("John", "Doe", "john.doe@example.com", "SecurePassword123!");
            user.SetEmailVerificationCode("123456", DateTime.UtcNow.AddMinutes(-1), user.FirstName, user.LastName, user.Email);

            // Act
            bool result = user.VerifyEmail("123456");

            // Assert
            Assert.False(result);
            Assert.False(user.IsEmailVerified);
        }
    }
}

