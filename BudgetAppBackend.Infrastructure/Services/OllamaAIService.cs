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
            var promptBuilder = new StringBuilder();

            promptBuilder.AppendLine("You are a highly skilled financial data analyst with expertise in transaction monitoring and anomaly detection.");
            promptBuilder.AppendLine("IMPORTANT: You must respond with ONLY valid JSON matching the structure specified below. Do not include any other text or markdown formatting.");
            promptBuilder.AppendLine("The response must be a single, complete JSON object with no trailing text.");
            promptBuilder.AppendLine("Do not include arrays for anomaliesOrRedFlags and recommendations - they should be string fields.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Analyze the following transactions to identify any unusual or suspicious spending patterns, trends, or anomalies.");

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Transactions (Date, Amount, Payee, Category):");
            foreach (var tx in transactions)
            {
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Category}");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Required JSON Response Structure (EXACTLY as shown):");
            promptBuilder.AppendLine("{");
            promptBuilder.AppendLine("  \"overview\": \"A summary of overall spending patterns\",");
            promptBuilder.AppendLine("  \"anomaliesOrRedFlags\": \"A description of suspicious transactions\",");
            promptBuilder.AppendLine("  \"recommendations\": \"2-3 actionable tips for improvement\",");
            promptBuilder.AppendLine("  \"disclaimer\": \"This is not financial advice\"");
            promptBuilder.AppendLine("}");

            var prompt = promptBuilder.ToString();
            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 5000,
                temperature = 0.8,
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

                // Log the raw LLM response for debugging
                Console.WriteLine($"Raw LLM Response: {llmResponse}");

                // Extract the first complete JSON object
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

                // Clean up the JSON string
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
                    anomaliesOrRedFlags = ConvertToString(tempRoot.GetProperty("anomaliesOrRedFlags")),
                    recommendations = ConvertToString(tempRoot.GetProperty("recommendations")),
                    disclaimer = tempRoot.GetProperty("disclaimer").GetString()?.Trim() ?? ""
                };

                // Convert back to JSON string
                jsonString = JsonSerializer.Serialize(cleanedObject);

                Console.WriteLine($"Cleaned JSON string: {jsonString}");

                using var analysisDocument = JsonDocument.Parse(jsonString);
                var analysisRoot = analysisDocument.RootElement;

                return new QuarterlyTransactionAnalysis(
                    Overview: analysisRoot.GetProperty("overview").GetString() ?? "No overview provided",
                    AnomaliesOrRedFlags: analysisRoot.GetProperty("anomaliesOrRedFlags").GetString() ?? "No anomalies detected",
                    Recommendations: analysisRoot.GetProperty("recommendations").GetString() ?? "No recommendations provided",
                    Disclaimer: analysisRoot.GetProperty("disclaimer").GetString() ?? "This analysis is for informational purposes only and not financial advice"
                );
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse JSON. Response content: {responseContent}", ex);
            }
        }


        public async Task<SpendingForecast> ForecastSpendingTrends(IEnumerable<TransactionDto> transactions)
        {

            var historicalData = transactions.OrderBy(t => t.TransactionDate).ToList();
            var monthlyTotals = historicalData
                .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                .Select(g => new { Month = $"{g.Key.Year}-{g.Key.Month}", Total = g.Sum(t => t.Amount) })
                .ToList();

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("You are a financial analysis system. Analyze the transaction data and return ONLY a JSON object with numerical calculations.");
            promptBuilder.AppendLine("CRITICAL REQUIREMENTS:");
            promptBuilder.AppendLine("1. Return ONLY a valid JSON object with NO comments");
            promptBuilder.AppendLine("2. All numerical values must be plain numbers (no currency symbols or formatting)");
            promptBuilder.AppendLine("3. Use these EXACT property names:");
            promptBuilder.AppendLine("   - totalForecastedSpending");
            promptBuilder.AppendLine("   - averageMonthlySpending");
            promptBuilder.AppendLine("   - trendDirection");
            promptBuilder.AppendLine("   - percentageChange");
            promptBuilder.AppendLine();

            promptBuilder.AppendLine("Monthly Spending Summary:");
            foreach (var month in monthlyTotals)
            {
                promptBuilder.AppendLine($"{month.Month}: {month.Total:F2}");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Recent Transactions:");
            foreach (var tx in historicalData.TakeLast(10))
            {
                promptBuilder.AppendLine($"{tx.TransactionDate:yyyy-MM-dd}: {tx.Amount:F2} ({tx.Category})");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Example of REQUIRED response format:");
            promptBuilder.AppendLine("{");
            promptBuilder.AppendLine("  \"totalForecastedSpending\": 1234.56,");
            promptBuilder.AppendLine("  \"averageMonthlySpending\": 411.52,");
            promptBuilder.AppendLine("  \"trendDirection\": \"increasing\",");
            promptBuilder.AppendLine("  \"percentageChange\": 15.5");
            promptBuilder.AppendLine("}");

            var prompt = promptBuilder.ToString();
            var requestBody = new
            {
                model = _ollamaSettings.Model,
                prompt = prompt,
                max_tokens = 150,
                temperature = 0,
                format = "json",
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            try
            {
                var ollamaEndpoint = _ollamaSettings.Endpoint;
                var response = await _httpClient.PostAsync($"{ollamaEndpoint}/v1/completions", jsonContent);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var forecast = ParseForecastResponse(responseContent);

                if (!IsValidForecast(forecast))
                {
                    throw new InvalidOperationException("Generated forecast contains invalid values");
                }

                return forecast;
            }
            catch (Exception ex)
            {

                throw new InvalidOperationException("Generated forecast contains invalid values");
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
                promptBuilder.AppendLine($"- Date: {tx.TransactionDate:yyyy-MM-dd}, Amount: {tx.Amount}, Payee: {tx.Payee}, Type: {tx.Category}");
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
    }

}
