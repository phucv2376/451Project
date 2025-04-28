import API_BASE_URL from "@/app/config";
import { Budget } from "../models/Budget"; // Assuming you have a Budget type/interface
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { getTransactions } from "./transactionService";
import { FilteredTransaction } from "../models/Transaction";

/**
 * Creates a new budget for a user.
 * @param userId - The ID of the user.
 * @returns A success status or an error message.
 */
export const createBudget = async (newBudget: Budget) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Budget/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            //credentials: "include",
            body: JSON.stringify(newBudget)
        });

        if (!response.ok) {
            let errorMessage = "Failed to create budget. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        // If you expect data in the response, you can parse it here
        // const data: Budget = await response.json();

        return { success: true, message: "Budget created successfully" };

    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};

/**
 * Fetches the list of budgets for a user
 * @param userId - The ID of the user
 * @returns Promise<BudgetListResponse> - List of budgets or error message
 */
export const getBudgetList = async (userId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Budget/list-of-budgets?userId=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });

        if (!response.ok) {
            let errorMessage = "Failed to fetch budgets. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        const data: Budget[] = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Network error:", error);
        return {
            success: false,
            message: "A network error occurred. Please check your connection and try again."
        };
    }
};

/**
 * Deletes a budget by ID
 * @param budgetId - The ID of the budget to delete
 * @param userId - The ID of the user who owns the budget
 * @returns Promise with success status and message
 */
export const deleteBudget = async (deleteBudget: Budget) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Budget/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(deleteBudget),
            credentials: "include"
        });

        if (!response.ok) {
            let errorMessage = "Failed to delete budget. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }
        return { success: true, message: "Budget deleted successfully" };

    } catch (error) {
        console.error("Network error:", error);
        return {
            success: false,
            message: "A network error occurred. Please check your connection and try again."
        };
    }
};

/**
 * Fetches and sums transactions by category for the last 4 months
 * @param userId - The ID of the user
 * @param category - The category to filter by
 * @returns Array of summed amounts for each month
 */
export const getMonthlyCategoryData = async (userId: string, category: string) => {
  const monthlyData: number[] = [];
  const currentDate = new Date();
  
  // Get the last 4 months
  const months = Array.from({ length: 4 }, (_, i) => {
    return subMonths(currentDate, 3 - i); // Gets [Jan, Feb, Mar, Apr] if current month is April
  });

  // Fetch and sum transactions for each month
  for (const month of months) {
    try {
      const startDate = startOfMonth(month);
      const endDate = endOfMonth(month);
      
      // Create properly typed FilteredTransaction object
      const filters: FilteredTransaction = {
        Category: category,
        StartDate: startDate,
        EndDate: endDate,
      };

      const result = await getTransactions(
        userId, 
        undefined, 
        undefined, 
        filters
      );

      if (result.success && result.data?.data) {
        const monthlySum = result.data.data.reduce((sum, transaction) => {
          return sum + Math.abs(transaction.amount);
        }, 0);
        monthlyData.push(parseFloat(monthlySum.toFixed(2)));
      } else {
        monthlyData.push(0);
      }
    } catch (error) {
      console.error(`Error fetching data for month:`, error);
      monthlyData.push(0);
    }
  }

  return monthlyData;
};