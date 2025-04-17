namespace BudgetAppBackend.Application.Models
{
    public class ChatHistory
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public List<ChatMessage> Messages { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
