namespace BudgetAppBackend.Application.Models
{
    public class AISettings
    {
        public OllamaSettings Ollama { get; set; } = new();
    }
}
