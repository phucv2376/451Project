using System.Text;
using System.Text.Json;
using BudgetAppBackend.Application.Configuration;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.BudgetAggregate;
using BudgetAppBackend.Domain.TransactionAggregate;
using Microsoft.Extensions.Options;

namespace BudgetAppBackend.Infrastructure.Services
{
    public class OllamaAIService : IAIAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly OllamaSettings _ollamaSettings;

        public OllamaAIService(HttpClient httpClient, IOptions<OllamaSettings> ollamaSettings)
        {
            _httpClient = httpClient;
            _ollamaSettings = ollamaSettings.Value;
        }

        public async Task<string> AnalyzeSpendingPatterns(IEnumerable<Transaction> transactions)
        {

            var promptBuilder = new StringBuilder();

            promptBuilder.AppendLine("You are a highly skilled financial data analyst with expertise in transaction monitoring and anomaly detection.");

            promptBuilder.AppendLine("Analyze the following transactions to identify any unusual or suspicious spending patterns, trends, or anomalies. " +
                                    "If you detect possible concerns, provide clear reasoning and context.");
            promptBuilder.AppendLine("Additionally, offer concise recommendations for how the user can address these issues or improve their spending habits.");

            promptBuilder.AppendLine("Note: This analysis is for informational purposes only and should not be considered financial or legal advice.");

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Transactions (Date, Amount, Payee, Type):");
            foreach (var tx in transactions)
            {

                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Type}");
            }


            promptBuilder.AppendLine();
            promptBuilder.AppendLine("When you respond, please use the following structure:");
            promptBuilder.AppendLine("1) Overview: Summarize the overall spending patterns and key observations.");
            promptBuilder.AppendLine("2) Anomalies or Red Flags: List any suspicious or unusual transactions (if any) and explain why they stand out.");
            promptBuilder.AppendLine("3) Recommendations: Provide 2-3 concrete, actionable tips for improving or monitoring spending habits.");
            promptBuilder.AppendLine("4) Disclaimer: Reiterate that this is not financial or legal advice.");


            var prompt = promptBuilder.ToString();
            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 1000,
                temperature = 0.7
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var ollamaEndpoint = _ollamaSettings.Endpoint ?? "http://localhost:11434";

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

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("Based on the following budget allocations and recent transactions, provide personalized budget recommendations:");

            promptBuilder.AppendLine("Budgets:");
            foreach (var budget in budgets)
            {
                promptBuilder.AppendLine($"- Title: {budget.Title}, Total Amount: {budget.TotalAmount}");
            }

            promptBuilder.AppendLine("Recent Transactions:");
            foreach (var tx in transactions.OrderByDescending(t => t.TransactionDate).Take(5))
            {
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Type}");
            }
            string prompt = promptBuilder.ToString();

            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 200,
                temperature = 0.7
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var ollamaEndpoint = _ollamaSettings.Endpoint ?? "http://localhost:11434";

            var response = await _httpClient.PostAsync($"{ollamaEndpoint}/v1/completions", jsonContent);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            var text = root.GetProperty("choices")[0].GetProperty("text").GetString();

            return text ?? string.Empty;
        }
    }


    public record SpendingAnalysis
(
    string Overview,
    string AnomaliesOrRedFlags,
    string Recommendations,
    string Disclaimer
);
}
