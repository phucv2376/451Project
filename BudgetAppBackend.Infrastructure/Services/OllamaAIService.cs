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
    public class OllamaAIService : IAIAnalysisService
    {

        private readonly HttpClient _httpClient;
        private readonly OllamaSettings _ollamaSettings;

        public OllamaAIService(HttpClient httpClient, IOptions<OllamaSettings> ollamaSettings)
        {
            _httpClient = httpClient;
            _ollamaSettings = ollamaSettings.Value;
        }

        public async Task<QuarterlyTransactionAnalysis> AnalyzeSpendingPatternsForLastThreeMonth(IEnumerable<TransactionDto> transactions)
        {
            DateTime threeMonthsAgo = DateTime.UtcNow.AddDays(-90);
            var promptBuilder = new StringBuilder();

            promptBuilder.AppendLine("You are a highly skilled financial data analyst with expertise in transaction monitoring and anomaly detection.");
            promptBuilder.AppendLine("IMPORTANT: You must respond with ONLY valid JSON matching the structure specified below. Do not include any other text or markdown formatting.");
            promptBuilder.AppendLine("The response must be a single, complete JSON object with no trailing text.");
            promptBuilder.AppendLine("Do not include arrays for anomaliesOrRedFlags and recommendations - they should be string fields.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Provide a detailed, comprehensive analysis of the transactions from the last 3 months (from" + threeMonthsAgo.ToString() + " to" + DateTime.Now.ToString() + ". For each section, provide extensive analysis with specific examples and detailed explanations:");

            var totalSpending = transactions.Sum(t => t.Amount);
            var averageTransaction = transactions.Average(t => t.Amount);
            var maxTransaction = transactions.Max(t => t.Amount);
            var minTransaction = transactions.Min(t => t.Amount);
            var transactionCount = transactions.Count();

            promptBuilder.AppendLine("\nLast 3 Months Transaction Summary:");
            promptBuilder.AppendLine($"- Total Transactions: {transactionCount}");
            promptBuilder.AppendLine($"- Total Spending: ${totalSpending:F2}");
            promptBuilder.AppendLine($"- Average Transaction: ${averageTransaction:F2}");
            promptBuilder.AppendLine($"- Highest Transaction: ${maxTransaction:F2}");
            promptBuilder.AppendLine($"- Lowest Transaction: ${minTransaction:F2}");

            var categoryBreakdown = transactions
                .GroupBy(t => t.Categories.FirstOrDefault())
                .Select(g => new {
                    Category = g.Key,
                    Total = g.Sum(t => t.Amount),
                    Count = g.Count(),
                    Percentage = (g.Sum(t => t.Amount) / totalSpending) * 100
                })
                .OrderByDescending(x => x.Total);

            promptBuilder.AppendLine("\nCategory Breakdown (Last 3 Months):");
            foreach (var category in categoryBreakdown)
            {
                promptBuilder.AppendLine($"- {category.Category}: ${category.Total:F2} ({category.Count} transactions, {category.Percentage:F1}% of total)");
            }

            var dailySpending = transactions
                .GroupBy(t => t.TransactionDate.Date)
                .Select(g => new { Date = g.Key, Total = g.Sum(t => t.Amount) })
                .OrderBy(x => x.Date);

            promptBuilder.AppendLine("\nDaily Spending Pattern (Last 3 Months):");
            foreach (var day in dailySpending)
            {
                promptBuilder.AppendLine($"- {day.Date:yyyy-MM-dd}: ${day.Total:F2}");
            }

            promptBuilder.AppendLine("\nDetailed Transactions (Last 3 Months):");
            foreach (var tx in transactions.OrderByDescending(t => t.TransactionDate))
            {
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: ${tx.Amount:F2}, Payee: {tx.Payee}, Category: {tx.Categories}");
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
            promptBuilder.AppendLine("  \"comparativeAnalysis\": \"Comparison with typical spending patterns and benchmarks (minimum 200 words)\",");
            promptBuilder.AppendLine("  \"disclaimer\": \"This is not financial advice\"");
            promptBuilder.AppendLine("}");

            promptBuilder.AppendLine("\nIMPORTANT: For each section, provide detailed analysis with specific examples, data points, and actionable insights. " +
                "Use the transaction data provided to support your analysis.");

            var prompt = promptBuilder.ToString();
            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 10000,
                temperature = 0.5,
                format = "json"
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

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

                Console.WriteLine($"Raw LLM Response: {llmResponse}");

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
                    anomaliesOrRedFlags = ConvertToString(tempRoot.GetProperty("anomaliesOrRedFlags")),
                    timeBasedInsights = tempRoot.GetProperty("timeBasedInsights").GetString()?.Trim() ?? "",
                    recommendations = ConvertToString(tempRoot.GetProperty("recommendations")),
                    riskAssessment = tempRoot.GetProperty("riskAssessment").GetString()?.Trim() ?? "",
                    opportunities = tempRoot.GetProperty("opportunities").GetString()?.Trim() ?? "",
                    futureProjections = tempRoot.GetProperty("futureProjections").GetString()?.Trim() ?? "",
                    comparativeAnalysis = tempRoot.GetProperty("comparativeAnalysis").GetString()?.Trim() ?? "",
                    disclaimer = tempRoot.GetProperty("disclaimer").GetString()?.Trim() ?? ""
                };

                // Convert back to JSON string
                jsonString = JsonSerializer.Serialize(cleanedObject);

                Console.WriteLine($"Cleaned JSON string: {jsonString}");

                using var analysisDocument = JsonDocument.Parse(jsonString);
                var analysisRoot = analysisDocument.RootElement;

                return new QuarterlyTransactionAnalysis(
                    Overview: analysisRoot.GetProperty("overview").GetString()?.Trim() ?? "No overview provided",
                    SpendingTrends: analysisRoot.GetProperty("spendingTrends").GetString()?.Trim() ?? "No spending trends identified",
                    CategoryAnalysis: analysisRoot.GetProperty("categoryAnalysis").GetString()?.Trim() ?? "No category analysis available",
                    AnomaliesOrRedFlags: ConvertToString(analysisRoot.GetProperty("anomaliesOrRedFlags")) ?? "No anomalies detected",
                    TimeBasedInsights: analysisRoot.GetProperty("timeBasedInsights").GetString()?.Trim() ?? "No time-based insights available",
                    Recommendations: ConvertToString(analysisRoot.GetProperty("recommendations")) ?? "No recommendations provided",
                    RiskAssessment: analysisRoot.GetProperty("riskAssessment").GetString()?.Trim() ?? "No risk assessment available",
                    Opportunities: analysisRoot.GetProperty("opportunities").GetString()?.Trim() ?? "No opportunities identified",
                    FutureProjections: analysisRoot.GetProperty("futureProjections").GetString()?.Trim() ?? "No future projections available",
                    ComparativeAnalysis: analysisRoot.GetProperty("comparativeAnalysis").GetString()?.Trim() ?? "No comparative analysis available",
                    Disclaimer: analysisRoot.GetProperty("disclaimer").GetString()?.Trim() ?? "This analysis is for informational purposes only and not financial advice"
                );
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse JSON. Response content: {responseContent}", ex);
            }
        }


       

        //not yet tested
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
                temperature = 0.7
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


        private SpendingForecast ParseForecastResponse(string responseContent)
        {
            try
            {

                using var document = JsonDocument.Parse(responseContent);
                var root = document.RootElement;

                var llmResponse = root.GetProperty("choices")[0].GetProperty("text").GetString();
                Console.WriteLine(llmResponse);
                if (string.IsNullOrEmpty(llmResponse))
                {
                    throw new InvalidOperationException("Empty response received from LLM");
                }

                llmResponse = CleanJsonResponse(llmResponse);
                Console.WriteLine(llmResponse);

                var forecastJson = JsonDocument.Parse(llmResponse).RootElement;

                double ParseNumericValue(JsonElement element)
                {
                    if (element.ValueKind == JsonValueKind.String)
                    {
                        var str = element.GetString() ?? "0";
                        str = new string(str.Where(c => char.IsDigit(c) || c == '.' || c == '-').ToArray());
                        return double.TryParse(str, out var value) ? value : 0;
                    }
                    return element.GetDouble();
                }

                return new SpendingForecast(
                    TotalForecastedSpending: ParseNumericValue(forecastJson.GetProperty("totalForecastedSpending")),
                    AverageMonthlySpending: ParseNumericValue(forecastJson.GetProperty("averageMonthlySpending")),
                    TrendDirection: forecastJson.GetProperty("trendDirection").GetString()?.ToLower()?.Trim() ?? "stable",
                    PercentageChange: ParseNumericValue(forecastJson.GetProperty("percentageChange")),
                    ActionableInsights: "Based on the forecast analysis",
                    Disclaimer: "This forecast is based on historical data and should not be considered financial advice"
                );
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to parse forecast response", ex);
            }
        }

        private bool IsValidForecast(SpendingForecast forecast)
        {
            return forecast.TotalForecastedSpending > 0 &&
                   forecast.AverageMonthlySpending > 0 &&
                   new[] { "increasing", "decreasing", "stable" }.Contains(forecast.TrendDirection.ToLower()) &&
                   forecast.PercentageChange is >= -100 and <= 1000;
        }


        private string CleanJsonResponse(string response)
        {
            
            var start = response.IndexOf('{');
            if (start == -1)
                throw new InvalidOperationException("No JSON object found in response");

            var stack = new Stack<char>();
            var end = -1;

            for (var i = start; i < response.Length; i++)
            {
                if (response[i] == '{')
                    stack.Push('{');
                else if (response[i] == '}')
                {
                    stack.Pop();
                    if (stack.Count == 0)
                    {
                        end = i;
                        break;
                    }
                }
            }

            if (end == -1)
                throw new InvalidOperationException("No valid JSON object found in response");
            var json = response.Substring(start, end - start + 1);
            json = Regex.Replace(json, @"//.*?(\r?\n|$)", "");
            json = Regex.Replace(json, @"\s+", " ").Trim();
            json = Regex.Replace(json, @",\s*}", "}");

            return json;
        }

        private string ConvertToString(JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.String)
            {
                return element.GetString()?.Trim() ?? "";
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                var items = new List<string>();
                foreach (var item in element.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Object)
                    {
                        var desc = new List<string>();
                        foreach (var prop in item.EnumerateObject())
                        {
                            desc.Add($"{prop.Name}: {prop.Value}");
                        }
                        items.Add(string.Join(", ", desc));
                    }
                    else
                    {
                        items.Add(item.ToString());
                    }
                }
                return string.Join(". ", items);
            }
            else if (element.ValueKind == JsonValueKind.Object)
            {
                var desc = new List<string>();
                foreach (var prop in element.EnumerateObject())
                {
                    desc.Add($"{prop.Name}: {prop.Value}");
                }
                return string.Join(". ", desc);
            }
            return "";
        }

        private string DetermineTrendDirection(IEnumerable<dynamic> monthlyTotals)
        {
            if (!monthlyTotals.Any() || monthlyTotals.Count() < 2) return "stable";
            
            var lastMonth = (decimal)monthlyTotals.Last().Total;
            var previousMonth = (decimal)monthlyTotals.ElementAt(monthlyTotals.Count() - 2).Total;
            
            if (lastMonth > previousMonth) return "increasing";
            if (lastMonth < previousMonth) return "decreasing";
            return "stable";
        }

        private double CalculatePercentageChange(IEnumerable<dynamic> monthlyTotals)
        {
            if (!monthlyTotals.Any() || monthlyTotals.Count() < 2) return 0;
            
            var lastMonth = (decimal)monthlyTotals.Last().Total;
            var previousMonth = (decimal)monthlyTotals.ElementAt(monthlyTotals.Count() - 2).Total;
            
            return ((double)(lastMonth - previousMonth) / (double)previousMonth) * 100;
        }
    }

}
