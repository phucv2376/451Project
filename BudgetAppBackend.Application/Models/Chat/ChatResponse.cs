namespace BudgetAppBackend.Application.Models.Chat
{
    public class ChatResponse
    {
        public string Message { get; set; }
        public Guid ConversationId { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
