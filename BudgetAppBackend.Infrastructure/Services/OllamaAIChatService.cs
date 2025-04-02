using BudgetAppBackend.Application.Configuration;
using BudgetAppBackend.Application.Contracts;
using BudgetAppBackend.Application.Models.Chat;
using BudgetAppBackend.Application.Models;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.UserAggregate.ValueObjects;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text;

public class OllamaAIChatService : IAIChatService
{
    private readonly HttpClient _httpClient;
    private readonly OllamaSettings _ollamaSettings;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IBudgetRepository _budgetRepository;
    private readonly ILogger<OllamaAIChatService> _logger;

    public OllamaAIChatService(
        HttpClient httpClient,
        IOptions<OllamaSettings> ollamaSettings,
        ITransactionRepository transactionRepository,
        IBudgetRepository budgetRepository,
        ILogger<OllamaAIChatService> logger)
    {
        _httpClient = httpClient;
        _ollamaSettings = ollamaSettings.Value;
        _transactionRepository = transactionRepository;
        _budgetRepository = budgetRepository;
        _logger = logger;
    }

    public async Task<ChatResponse> SendMessage(ChatRequest request)
    {
        try
        {
            var userContext = await GetUserFinancialContext(request.UserId);
            var promptBuilder = new StringBuilder();

            // Build system prompt with user's financial context
            promptBuilder.AppendLine("You are a financial AI assistant with access to the user's financial data. ");
            promptBuilder.AppendLine("Use the following financial context to provide relevant and personalized responses:");
            promptBuilder.AppendLine($"\nUser's Financial Context:");
            promptBuilder.AppendLine($"- Total Transactions: {userContext.TransactionCount}");
            promptBuilder.AppendLine($"- Total Spending: ${userContext.TotalSpending:F2}");
            promptBuilder.AppendLine($"- Recent Spending: ${userContext.RecentSpending:F2}");

            // Add current user message
            promptBuilder.AppendLine($"\nUser: {request.Message}");

            // Add response format instructions
            promptBuilder.AppendLine("\nProvide a response that is:");
            promptBuilder.AppendLine("1. Relevant to the user's financial context");
            promptBuilder.AppendLine("2. Specific to their spending patterns and budgets");
            promptBuilder.AppendLine("3. Actionable and practical");
            promptBuilder.AppendLine("4. Professional yet conversational");

            var prompt = promptBuilder.ToString();
            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 1000,
                temperature = 0.7,
                stream = false
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync($"{_ollamaSettings.Endpoint}/v1/completions", jsonContent);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var llmResponse = ParseLLMResponse(responseContent);

            return new ChatResponse
            {
                Message = llmResponse,
                ConversationId = Guid.Empty,
                Timestamp = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message");
            return new ChatResponse
            {
                Message = "I'm sorry, I'm having trouble processing your request. Please try again later.",
                ConversationId = Guid.Empty,
                Timestamp = DateTime.UtcNow
            };
        }
    }

    public async IAsyncEnumerable<string> StreamMessage(ChatRequest request)
    {
        var userContext = await GetUserFinancialContext(request.UserId);
        var promptBuilder = new StringBuilder();

        // Build system prompt with user's financial context
        promptBuilder.AppendLine("You are a financial AI assistant with access to the user's financial data. ");
        promptBuilder.AppendLine("Use the following financial context to provide relevant and personalized responses:");
        promptBuilder.AppendLine($"\nUser's Financial Context:");
        promptBuilder.AppendLine($"- Total Transactions: {userContext.TransactionCount}");
        promptBuilder.AppendLine($"- Total Spending: ${userContext.TotalSpending:F2}");
        promptBuilder.AppendLine($"- Recent Spending: ${userContext.RecentSpending:F2}");

        // Add current user message
        promptBuilder.AppendLine($"\nUser: {request.Message}");

        // Add response format instructions
        promptBuilder.AppendLine("\nProvide a response that is:");
        promptBuilder.AppendLine("1. Relevant to the user's financial context");
        promptBuilder.AppendLine("2. Specific to their spending patterns and budgets");
        promptBuilder.AppendLine("3. Actionable and practical");
        promptBuilder.AppendLine("4. Professional yet conversational");

        var prompt = promptBuilder.ToString();
        var requestBody = new
        {
            model = _ollamaSettings.Model,
            prompt = prompt,
            max_tokens = 1000,
            temperature = 0.7,
            stream = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );

        HttpResponseMessage? response = null;
        try
        {
            response = await _httpClient.PostAsync($"{_ollamaSettings.Endpoint}/v1/completions", jsonContent);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error making request to Ollama");
           
            yield break;
        }

        if (response == null)
        {
            yield return "Failed to get response from the AI service.";
            yield break;
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line)) continue;

            if (line.StartsWith("data: "))
            {
                var jsonStr = line.Substring(6);
                if (jsonStr == "[DONE]")
                {
                    break;
                }

                string? text = null;
                try
                {
                    using var document = JsonDocument.Parse(jsonStr);
                    var root = document.RootElement;
                    text = root.GetProperty("choices")[0].GetProperty("text").GetString();
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse streaming response line");
                    continue;
                }

                if (!string.IsNullOrEmpty(text))
                {
                    yield return text;
                }
            }
        }
    }

    private async Task<UserFinancialContext> GetUserFinancialContext(UserId userId)
    {
        var transactions = await _transactionRepository.GetThreeMonthTransactionsByUserIdAsync(userId);

        return new UserFinancialContext
        {
            TransactionCount = transactions.Count(),
            TotalSpending = transactions.Sum(t => Math.Abs(t.Amount)),
            RecentSpending = transactions
                .Where(t => t.TransactionDate >= DateTime.UtcNow.AddDays(-30))
                .Sum(t => Math.Abs(t.Amount))
        };
    }

    private string ParseLLMResponse(string responseContent)
    {
        using var document = JsonDocument.Parse(responseContent);
        var root = document.RootElement;
        return root.GetProperty("choices")[0].GetProperty("text").GetString() ?? string.Empty;
    }
}