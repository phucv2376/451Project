using BudgetAppBackend.Domain.Commons;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Domain.UserAggregate
{
    public sealed class User : AggregateRoot<UserId>
    {
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string Email { get; private set; }
        public byte[] PasswordHash { get; private set; }
        public byte[] PasswordSalt { get; private set; }
        public bool IsEmailVerified { get; private set; }
        public string? EmailVerificationCode { get; private set; }
        public DateTime? EmailVerificationCodeExpiry { get; private set; }

        private User() : base(default!)
        {
            // It's mainly used for ORM frameworks that require a parameterless constructor.
        }

        private User(UserId id = null!, string firstName = null!, string lastName = null!, string email = null!, byte[] passwordHash = null!, byte[] passwordSalt = null!) : base(id)
        {
            FirstName = ValidateString(firstName, nameof(FirstName));
            LastName = ValidateString(lastName, nameof(LastName));
            Email = ValidateEmail(email);
            PasswordHash = passwordHash ?? throw new ArgumentNullException(nameof(passwordHash));
            PasswordSalt = passwordSalt ?? throw new ArgumentNullException(nameof(passwordSalt));
            IsEmailVerified = false;
        }

        public static User CreateNewUser(string firstName, string lastName, string email, byte[] passwordHash, byte[] passwordSalt)
        {
            var id = UserId.CreateId();
            return new User(id, firstName, lastName, email, passwordHash, passwordSalt);
        }

        public void ChangePassword(byte[] newPasswordHash, byte[] newPasswordSalt)
        {
            if (newPasswordHash == null || newPasswordHash.Length == 0)
                throw new ArgumentException("Password hash cannot be null or empty.", nameof(newPasswordHash));

            if (newPasswordSalt == null || newPasswordSalt.Length == 0)
                throw new ArgumentException("Password salt cannot be null or empty.", nameof(newPasswordSalt));

            PasswordHash = newPasswordHash;
            PasswordSalt = newPasswordSalt;
        }


        private static string ValidateString(string value, string propertyName)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException($"{propertyName} cannot be null or empty.", propertyName);
            return value;
        }

        private static string ValidateEmail(string email)
        {
            if (!email.Contains("@"))
                throw new ArgumentException("Invalid email format.", nameof(email));
            return email;
        }

        public static string GenerateVerificationToken()
        {
            return new Random().Next(100000, 999999).ToString();
        }

        public void SetEmailVerificationCode(string code, DateTime expiry)
        {
            EmailVerificationCode = code;
            EmailVerificationCodeExpiry = expiry;
        }

        public bool VerifyEmail(string code)
        {
            if (code == EmailVerificationCode && EmailVerificationCodeExpiry > DateTime.UtcNow)
            {
                IsEmailVerified = true;
                EmailVerificationCode = null;
                EmailVerificationCodeExpiry = null;
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
