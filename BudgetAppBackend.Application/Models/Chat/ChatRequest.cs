using BudgetAppBackend.Domain.UserAggregate.ValueObjects;

namespace BudgetAppBackend.Application.Models.Chat
{
    public class ChatRequest
    {
        public UserId UserId { get; set; }
        public string Message { get; set; }
    }
}
