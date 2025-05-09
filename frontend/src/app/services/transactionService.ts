import API_BASE_URL from "@/app/config";
import { AddEditTransaction, EditTransaction, FilteredTransaction, Transaction, TransactionListResponse } from "../models/Transaction";


/**
 * Fetches the most recent transactions for a user.
 * @param userId - The ID of the user.
 * @returns A list of recent transactions or an error message.
*/
export const getRecentTransactions = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Transaction/user/${userId}/recent-transactions`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include"

        });

        if (!response.ok) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        const data: Transaction[] = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};


/**
 * Fetches a list of transactions for a specific user.
 * @param userId - The ID of the user whose transactions are to be fetched.
 * @param page - The page number to fetch (optional).
 * @param rowCount - The number of transactions per page (optional).
 * @returns A success response with the list of transactions or an error message.
 */
export const getTransactions = async (
    userId: string,
    rowCount?: number,
    page?: number,
    filtered?: FilteredTransaction
) => {
    try {
        // Construct the URL with optional query parameters for pagination
        let url = `${API_BASE_URL}/Transaction/user/${userId}/list-of-transactions?`;
        if (page !== undefined && rowCount !== undefined) {
            url += `rowCount=${rowCount}&pageNumber=${page}`;
        }
        // Create query parameters object
        const queryParams = new URLSearchParams();

        if (filtered !== undefined) {
            if (filtered.MinAmount !== undefined && filtered.MinAmount !== null)
                queryParams.append("MinAmount", filtered.MinAmount.toString());
            if (filtered.MaxAmount !== undefined && filtered.MaxAmount != null)
                queryParams.append("MaxAmount", filtered.MaxAmount.toString());
            if (filtered.StartDate !== undefined && filtered.StartDate !== null) 
                queryParams.append("StartDate", (filtered.StartDate.toISOString()));
            if (filtered.EndDate !== undefined && filtered.EndDate !== null)
                queryParams.append("EndDate", (filtered.EndDate.toISOString()));
            if (filtered.Category !== undefined && filtered.Category !== null)
                queryParams.append("Category", filtered.Category);
        }
        // Append query parameters if any exist
        if ([...queryParams].length > 0) {
            url += `&${queryParams.toString()}`;
        }
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        const data: TransactionListResponse = await response.json();
        //console.log("data Info:", data.data);

        return { success: true, data };

    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};

/*
* Deletes a transaction by its ID.
* @param transactionId - The ID of the transaction to delete.
* @param userId - The ID of the user associated with the transaction.
* @returns A success response or an error message.
*/
export const deleteTransaction = async (transactionId: string, userId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Transaction/delete/${transactionId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactionId, userId }), // Include userId in the request body
        });

        if (!response.ok) {
            // Handle 404 or other error statuses
            const errorMessage = response.status === 404
                ? "Cannot delete bank account transactions"
                : "Failed to delete transaction";
            return { success: false, message: errorMessage };
        }

        // Successful deletion (200 OK)
        return { success: true };

    } catch (error) {
        console.error("Network error:", error);
        return {
            success: false,
            message: "A network error occurred. Please check your connection and try again."
        };
    }
};

/**
 * Creates a new transaction.
 * @param transactionData - The transaction data to create.
 * @returns A success response with the created transaction or an error message.
 */
export const createTransaction = async (transactionData: AddEditTransaction) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Transaction/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
            let errorMessage = "Failed to create transaction. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Network error:", error);
        return {
            success: false,
            message: "A network error occurred. Please check your connection and try again."
        };
    }
}

/**
* Updates an existing transaction.
* @param transactionId - The ID of the transaction to update.
* @param transactionData - The updated transaction data.
* @returns A success response with the updated transaction or an error message.
*/
export const updateTransaction = async (transactionId: string, transactionData:EditTransaction) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Transaction/update/${transactionId}`,
            {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(transactionData),
            }
        );

        if (!response.ok) {
            let errorMessage = "Failed to update transaction. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }
        return { success: true, message: "Transaction updated successfully" };

    } catch (error) {
        console.error("Network error:", error);
        return {
            success: false,
            message: "A network error occurred. Please check your connection and try again.",
        };
    }
};

/**
 * Fetches the monthly expenses for a user.
 * @param userId - The ID of the user.
 * @param token - The access token for authentication.
 * @returns A success response with the monthly expenses or an error message.
 */
export const getMonthlyExpenses = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Transaction/user/${userId}/monthly-expenses`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include"
        });

        if (!response.ok) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};

/**
 * Fetches the monthly income for a user.
 * @param userId - The ID of the user.
 * @param token - The access token for authentication.
 * @returns A success response with the monthly income or an error message.
 */
export const getMonthlyIncome = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Transaction/user/${userId}/monthly-income`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include"
        });

        if (!response.ok) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};