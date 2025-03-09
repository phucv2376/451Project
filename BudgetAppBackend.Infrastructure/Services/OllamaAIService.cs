using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.TransactionAggregate;
using Microsoft.Extensions.Configuration;

namespace BudgetAppBackend.Infrastructure.Services
{
    public class OllamaAIService : IAIAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public OllamaAIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> AnalyzeSpendingPatterns(IEnumerable<Transaction> transactions)
        {
            // Build prompt using only properties available in your Transaction configuration.
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("Analyze the following spending transactions and identify any unusual spending patterns:");

            foreach (var tx in transactions)
            {
                promptBuilder.AppendLine(
                    $"Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Type}"
                );
            }
            string prompt = promptBuilder.ToString();

            var requestBody = new
            {
                model = "llama2",  // Adjust the model name if necessary.
                prompt = prompt,
                max_tokens = 150,
                temperature = 0.7
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var ollamaEndpoint = _configuration["Ollama:Endpoint"] ?? "http://localhost:11434";

            var response = await _httpClient.PostAsync($"{ollamaEndpoint}/v1/completions", jsonContent);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            var text = root.GetProperty("choices")[0].GetProperty("text").GetString();

            return text ?? string.Empty;
        }

        public async Task<string> GetBudgetRecommendations(IEnumerable<Budget> budgets, IEnumerable<Transaction> transactions)
        {
            // Build prompt from budgets and transactions using your data definitions.
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("Based on the following budget allocations and recent transactions, provide personalized budget recommendations:");

            promptBuilder.AppendLine("Budgets:");
            foreach (var budget in budgets)
            {
                // Using Title and TotalAmount per your configuration.
                promptBuilder.AppendLine($"- Title: {budget.Title}, Total Amount: {budget.TotalAmount}");
            }

            promptBuilder.AppendLine("Recent Transactions:");
            foreach (var tx in transactions.OrderByDescending(t => t.TransactionDate).Take(5))
            {
                // Using TransactionDate, Amount, Payee, and Type.
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Type}");
            }
            string prompt = promptBuilder.ToString();

            var requestBody = new
            {
                model = "llama2",  // Adjust as necessary.
                prompt = prompt,
                max_tokens = 200,
                temperature = 0.7
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var ollamaEndpoint = _configuration["Ollama:Endpoint"] ?? "http://localhost:11434";

            var response = await _httpClient.PostAsync($"{ollamaEndpoint}/v1/completions", jsonContent);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            var text = root.GetProperty("choices")[0].GetProperty("text").GetString();

            return text ?? string.Empty;
        }
    }
}
