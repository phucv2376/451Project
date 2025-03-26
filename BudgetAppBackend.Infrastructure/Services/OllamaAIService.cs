using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using BudgetAppBackend.Application.Configuration;
using BudgetAppBackend.Application.DTOs.AiAnalysisDTOS;
using BudgetAppBackend.Application.DTOs.TransactionDTOs;
using BudgetAppBackend.Application.Service;
using BudgetAppBackend.Domain.BudgetAggregate;
using Microsoft.Extensions.Options;

namespace BudgetAppBackend.Infrastructure.Services
{
    /// <summary>
    /// Implementation of the AI analysis service using the Ollama LLM API.
    /// This service generates financial insights based on user transactions and budgets.
    /// </summary>
    public class OllamaAIService : IAIAnalysisService
    {

        private readonly HttpClient _httpClient;
        private readonly OllamaSettings _ollamaSettings;

        public OllamaAIService(HttpClient httpClient, IOptions<OllamaSettings> ollamaSettings)
        {
            _httpClient = httpClient;
            _ollamaSettings = ollamaSettings.Value;
        }

        /// <summary>
        /// Analyzes the last 3 months of user transactions using an LLM and returns a comprehensive financial report.
        /// </summary>
        /// <param name="transactions">User transaction history from the last 3 months.</param>
        /// <returns>A structured financial analysis object including trends, risks, and suggestions.</returns>
        public async Task<QuarterlyTransactionAnalysis> AnalyzeSpendingPatternsForLastThreeMonth(IEnumerable<TransactionDto> transactions)
        {
            DateTime threeMonthsAgo = DateTime.UtcNow.AddDays(-90);
            var promptBuilder = new StringBuilder();

            // Build prompt for LLM analysis
            promptBuilder.AppendLine("You are a highly skilled financial data analyst with expertise in transaction monitoring and anomaly detection.");
            promptBuilder.AppendLine("IMPORTANT: You must respond with ONLY valid JSON matching the structure specified below. Do not include any other text or markdown formatting.");
            promptBuilder.AppendLine("The response must be a single, complete JSON object with no trailing text.");
            promptBuilder.AppendLine("Do not include arrays for anomaliesOrRedFlags and recommendations - they should be string fields.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Provide a detailed, comprehensive analysis of the transactions from the last 3 months (from" + threeMonthsAgo.ToString() + " to" + DateTime.Now.ToString() + ". For each section, provide extensive analysis with specific examples and detailed explanations:");

            // Append transaction summaries
            var totalSpending = transactions.Sum(t => Math.Abs(t.Amount));
            var averageTransaction = transactions.Average(t => Math.Abs(t.Amount));
            var maxTransaction = transactions.Max(t => Math.Abs(t.Amount));
            var minTransaction = transactions.Min(t => Math.Abs(t.Amount));
            var transactionCount = transactions.Count();

            
            promptBuilder.AppendLine("\nLast 3 Months Transaction Summary:");
            promptBuilder.AppendLine($"- Total Transactions: {transactionCount}");
            promptBuilder.AppendLine($"- Total Spending: ${totalSpending:F2}");
            promptBuilder.AppendLine($"- Average Transaction: ${averageTransaction:F2}");
            promptBuilder.AppendLine($"- Highest Transaction: ${maxTransaction:F2}");
            promptBuilder.AppendLine($"- Lowest Transaction: ${minTransaction:F2}");

            // Append category breakdown
            var categoryBreakdown = transactions
                .GroupBy(t => t.Categories.FirstOrDefault())
                .Select(g => new {
                    Category = g.Key,
                    Total = g.Sum(t => Math.Abs(t.Amount)),
                    Count = g.Count(),
                    Percentage = (g.Sum(t => Math.Abs(t.Amount)) / totalSpending) * 100
                })
                .OrderByDescending(x => x.Total);

            promptBuilder.AppendLine("\nCategory Breakdown (Last 3 Months):");
            foreach (var category in categoryBreakdown)
            {
                promptBuilder.AppendLine($"- {category.Category}: ${category.Total:F2} ({category.Count} transactions, {category.Percentage:F1}% of total)");
            }

            // Append daily pattern
            var dailySpending = transactions
                .GroupBy(t => t.TransactionDate.Date)
                .Select(g => new { Date = g.Key, Total = g.Sum(t => Math.Abs(t.Amount)) })
                .OrderBy(x => x.Date);

            promptBuilder.AppendLine("\nDaily Spending Pattern (Last 3 Months):");
            foreach (var day in dailySpending)
            {
                promptBuilder.AppendLine($"- {day.Date:yyyy-MM-dd}: ${day.Total:F2}");
            }

            // Append detailed transactions
            promptBuilder.AppendLine("\nDetailed Transactions (Last 3 Months):");
            foreach (var tx in transactions.OrderByDescending(t => t.TransactionDate))
            {
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: ${Math.Abs(tx.Amount):F2}, Payee: {tx.Payee}, Category: {tx.Categories}");
            }

            promptBuilder.AppendLine("\nRequired JSON Response Structure (EXACTLY as shown):");
            promptBuilder.AppendLine("{");
            promptBuilder.AppendLine("  \"overview\": \"A comprehensive summary of spending patterns (minimum 300 words)\",");
            promptBuilder.AppendLine("  \"spendingTrends\": \"Detailed analysis of spending trends and patterns (minimum 300 words)\",");
            promptBuilder.AppendLine("  \"categoryAnalysis\": \"In-depth analysis of spending by category with specific examples (minimum 300 words)\",");
            promptBuilder.AppendLine("  \"anomaliesOrRedFlags\": \"Detailed identification of unusual transactions or patterns with explanations (minimum 200 words)\",");
            promptBuilder.AppendLine("  \"timeBasedInsights\": \"Comprehensive analysis of spending patterns over time with trend identification (minimum 300 words)\",");
            promptBuilder.AppendLine("  \"recommendations\": \"Detailed, actionable recommendations for improvement with specific examples (minimum 300 words)\",");
            promptBuilder.AppendLine("  \"riskAssessment\": \"Thorough assessment of financial risks and concerns with mitigation strategies (minimum 200 words)\",");
            promptBuilder.AppendLine("  \"opportunities\": \"Detailed analysis of potential opportunities for optimization (minimum 200 words)\",");
            promptBuilder.AppendLine("  \"futureProjections\": \"Analysis of future spending patterns and potential impacts (minimum 200 words)\",");
            promptBuilder.AppendLine("  \"comparisonAnalysis\": \"Comparison with typical spending patterns and benchmarks (minimum 200 words)\",");
            promptBuilder.AppendLine("}");

            promptBuilder.AppendLine("\nIMPORTANT: For each section, provide detailed analysis with specific examples, data points, and actionable insights. " +
                "Use the transaction data provided to support your analysis.");

            var prompt = promptBuilder.ToString();
            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 5000,
                temperature = 0.0,
                format = "json"
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            // Send request to Ollama LLM
            var ollamaEndpoint = _ollamaSettings.Endpoint;

            var response = await _httpClient.PostAsync($"{ollamaEndpoint}/v1/completions", jsonContent);
          
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();

            try
            {
                using var document = JsonDocument.Parse(responseContent);
                var root = document.RootElement;

                var llmResponse = root.GetProperty("choices")[0].GetProperty("text").GetString();
                if (string.IsNullOrEmpty(llmResponse))
                {
                    throw new InvalidOperationException("Empty response received from LLM");
                }

                // Strip possible formatting artifacts
                llmResponse = Regex.Replace(llmResponse, @"<think>.*?</think>", "", RegexOptions.Singleline);

                //Console.WriteLine($"Raw LLM Response: {llmResponse}");

                // Extract clean JSON object from raw string
                var jsonStart = llmResponse.IndexOf('{');
                if (jsonStart == -1)
                {
                    throw new InvalidOperationException("No JSON object found in response");
                }

                var stack = new Stack<int>();
                var jsonEnd = -1;

                for (int i = jsonStart; i < llmResponse.Length; i++)
                {
                    if (llmResponse[i] == '{')
                    {
                        stack.Push(i);
                    }
                    else if (llmResponse[i] == '}')
                    {
                        if (stack.Count > 0)
                        {
                            stack.Pop();
                            if (stack.Count == 0)
                            {
                                jsonEnd = i;
                                break;
                            }
                        }
                    }
                }

                if (jsonEnd == -1 || jsonEnd <= jsonStart)
                {
                    throw new InvalidOperationException("No complete JSON object found in response");
                }

                var jsonString = llmResponse.Substring(jsonStart, jsonEnd - jsonStart + 1);

                jsonString = jsonString
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Replace("\n", " ")
                    .Replace("\r", " ")
                    .Replace("\\\"", "\"")
                    .Replace("Document:", "")
                    .Replace("01.json", "")
                    .Trim();

                // Remove any nested JSON objects or arrays for the required fields
                var tempDoc = JsonDocument.Parse(jsonString);
                var tempRoot = tempDoc.RootElement;

                var cleanedObject = new
                {
                    overview = tempRoot.GetProperty("overview").GetString()?.Trim() ?? "",
                    spendingTrends = tempRoot.GetProperty("spendingTrends").GetString()?.Trim() ?? "",
                    categoryAnalysis = tempRoot.GetProperty("categoryAnalysis").GetString()?.Trim() ?? "",
                    anomaliesOrRedFlags = tempRoot.GetProperty("anomaliesOrRedFlags").GetString()?.Trim() ?? "",
                    timeBasedInsights = tempRoot.GetProperty("timeBasedInsights").GetString()?.Trim() ?? "",
                    recommendations = tempRoot.GetProperty("recommendations").GetString()?.Trim() ?? "",
                    riskAssessment = tempRoot.GetProperty("riskAssessment").GetString()?.Trim() ?? "",
                    opportunities = tempRoot.GetProperty("opportunities").GetString()?.Trim() ?? "",
                    futureProjections = tempRoot.GetProperty("futureProjections").GetString()?.Trim() ?? "",
                    comparativeAnalysis = tempRoot.GetProperty("comparisonAnalysis").GetString()?.Trim() ?? ""
                };

                // Convert back to JSON string
                jsonString = JsonSerializer.Serialize(cleanedObject);

                //Console.WriteLine($"Cleaned JSON string: {jsonString}");

                // Re-parse and map to DTO
                using var analysisDocument = JsonDocument.Parse(jsonString);
                var analysisRoot = analysisDocument.RootElement;

                return new QuarterlyTransactionAnalysis(
                    Overview: analysisRoot.GetProperty("overview").GetString()?.Trim() ?? "No overview provided",
                    SpendingTrends: analysisRoot.GetProperty("spendingTrends").GetString()?.Trim() ?? "No spending trends identified",
                    CategoryAnalysis: analysisRoot.GetProperty("categoryAnalysis").GetString()?.Trim() ?? "No category analysis available",
                    AnomaliesOrRedFlags: analysisRoot.GetProperty("anomaliesOrRedFlags").GetString()?.Trim() ?? "No anomalies detected",
                    TimeBasedInsights: analysisRoot.GetProperty("timeBasedInsights").GetString()?.Trim() ?? "No time-based insights available",
                    Recommendations: analysisRoot.GetProperty("recommendations").GetString()?.Trim() ?? "No recommendations provided",
                    RiskAssessment: analysisRoot.GetProperty("riskAssessment").GetString()?.Trim() ?? "No risk assessment available",
                    Opportunities: analysisRoot.GetProperty("opportunities").GetString()?.Trim() ?? "No opportunities identified",
                    FutureProjections: analysisRoot.GetProperty("futureProjections").GetString()?.Trim() ?? "No future projections available",
                    ComparativeAnalysis: analysisRoot.GetProperty("comparativeAnalysis").GetString()?.Trim() ?? "No comparative analysis available",
                    Disclaimer: analysisRoot.TryGetProperty("disclaimer", out var disclaimerProp)
                        ? disclaimerProp.GetString()?.Trim() ?? "This analysis is for informational purposes only and not financial advice"
                        : "This analysis is for informational purposes only and not financial advice"
                );
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse JSON. Response content: {responseContent}", ex);
            }
        }

        //not yet tested
        /// <summary>
        /// Sends a smaller prompt to generate budget recommendations based on current budget setup and transactions.
        /// </summary>
        public async Task<string> GetBudgetRecommendations(IEnumerable<Budget> budgets, IEnumerable<TransactionDto> transactions)
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
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Categories}");
            }
            string prompt = promptBuilder.ToString();

            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 200,
                temperature = 0.0
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var ollamaEndpoint = _ollamaSettings.Endpoint;

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
