using BudgetAppBackend.Application.Models;
using BudgetAppBackend.Application.Models.Chat;

namespace BudgetAppBackend.Application.Service
{
    public interface IAIChatService
    {
        Task<ChatResponse> SendMessage(ChatRequest request);
        IAsyncEnumerable<string> StreamMessage(ChatRequest request);
    }
}
