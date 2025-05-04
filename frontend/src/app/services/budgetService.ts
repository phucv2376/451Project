import API_BASE_URL from "@/app/config";
import { Budget, MonthSummary } from "../models/Budget"; // Assuming you have a Budget type/interface
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { getTransactions } from "./transactionService";
import { FilteredTransaction, Transaction } from "../models/Transaction";

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
 * Updates a budget the user chooses.
 * @param userId - The ID of the user.
 * @returns A success status or an error message.
 */
export const updateBudget = async (budgetUpdate: Budget) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Budget/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(budgetUpdate)
        });

        if (!response.ok) {
            let errorMessage = "";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        return { success: true, message: "Budget updated successfully" };

    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
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
 * @param userId contains userId
 * @param category contains category name
 * @returns Array of summed amounts for each month
 */
export const fourMonthsSummary = async (userId : string, category : string) => {
    try {
        const encodedCategory = encodeURIComponent(category);
        const response = await fetch(`${API_BASE_URL}/Budget/last-four-mothns-total?userId=${userId}&categoryName=${encodedCategory}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        //console.log(response)

        if (!response.ok) {
            let errorMessage = "Failed to fetch budget summary. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }
        const data : MonthSummary[] = await response.json();
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
 * Fetches and sums transactions by category for the last 4 months
 * @param userId contains userId
 * @param category contains category name
 * @returns Array of summed amounts for each month
 */
export const topTransactionsBudget = async (userId : string, category : string) => {
    try {
        const encodedCategory = encodeURIComponent(category);
        const response = await fetch
        (`${API_BASE_URL}/Budget/top-five-current-month-transaction-by-budget?userId=${userId}&categoryName=${encodedCategory}`, 
            {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        //console.log(response)

        if (!response.ok) {
            let errorMessage = "Failed to fetch top transactions. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }
        const data : Transaction[] = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Network error:", error);
        return {
            success: false,
            message: "A network error occurred. Please check your connection and try again."
        };
    }

};