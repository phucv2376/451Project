import API_BASE_URL from "@/app/config";
import { Transaction, TransactionListResponse } from "../models/Transaction";


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
 * @param pageSize - The number of transactions per page (optional).
 * @returns A success response with the list of transactions or an error message.
 */
export const getTransactions = async (userId: string, page?: number, pageSize?: number) => {
    try {
        // Construct the URL with optional query parameters for pagination
        let url = `${API_BASE_URL}/Transaction/user/${userId}/list-of-transactions`;
        if (page !== undefined && pageSize !== undefined) {
            url += `?page=${page}&pageSize=${pageSize}`;
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