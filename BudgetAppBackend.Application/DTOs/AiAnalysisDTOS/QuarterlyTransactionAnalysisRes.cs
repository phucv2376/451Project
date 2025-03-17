namespace BudgetAppBackend.Application.DTOs.AiAnalysisDTOS;
public record QuarterlyTransactionAnalysis(
    string Overview,
    string AnomaliesOrRedFlags,
    string Recommendations,
    string Disclaimer
);