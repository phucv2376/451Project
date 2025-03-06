using BudgetAppBackend.Domain.Commons;

namespace BudgetAppBackend.Domain.Exceptions.BudgetExceptions
{
    public class BudgetAlreadyExistsException : DomainException
    {
        public BudgetAlreadyExistsException(Guid userId, Guid categoryId)
            : base($"A budget already exists for user '{userId}' and category '{categoryId}'.")
        {
        }
    }
}
