import API_BASE_URL from "@/app/config";
import { Budget } from "../models/Budget"; // Assuming you have a Budget type/interface

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