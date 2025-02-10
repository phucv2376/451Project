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

            // Act

            // Assert
        }

        [Fact]
        public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
        {
            // Arrange

            // Act

            // Assert
        }

        [Fact]
        public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
        {
            // Arrange
            
            // Act
          
            // Assert
           
        }

        [Fact]
        public void SetEmailVerificationCode_ShouldRaiseEvent()
        {
            // Arrange

            // Act

            // Assert

        }

        [Fact]
        public void VerifyEmail_ShouldReturnTrue_ForValidCodeAndNotExpired()
        {
            // Arrange

            // Act

            // Assert

        }

        [Fact]
        public void VerifyEmail_ShouldReturnFalse_ForInvalidCode()
        {
            // Arrange

            // Act

            // Assert

        }

        [Fact]
        public void VerifyEmail_ShouldReturnFalse_ForExpiredCode()
        {
            // Arrange

            // Act

            // Assert

        }
    }
}
