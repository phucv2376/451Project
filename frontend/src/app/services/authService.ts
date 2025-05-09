import API_BASE_URL from "@/app/config";
import { UserLogin, UserRegister, PasswordReset, EmailVerification } from '../models/auth';

/**
 * Registers a new user by sending their details to the backend.
 * @param userRegister - User registration data.
 * @returns A success response or an error message.
 */
export const registerNewUser = async (userRegister: UserRegister) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userRegister),
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
 * Verifies the user's email by sending a verification code to the backend.
 * @param emailVerification - Contains the email and verification code.
 * @returns A success response or an error message.
 */
export const verifyUserEmail = async (emailVerification: EmailVerification) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/verify-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailVerification),
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
        return { success: true, data : data };

    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};


/**
 * Logs in the user and stores their email in local storage.
 * @param userLogin - User credentials.
 * @returns A success response with user data or an error message.
 */
export const loginUserAccount = async (userLogin: UserLogin) => {
    'use client';
    
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(userLogin),
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
        localStorage.setItem("email", userLogin.email); // Store email for future use
        return { success: true, data };

    } catch (error) {
        console.error("Network error:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};


/**
 * Refreshes the authentication token using the user's stored email.
 * @returns A success response with the new token or an error message.
 */
export const refreshUserToken = async () => {
    try {
        const email = localStorage.getItem("email");

        if (!email) {
            console.warn("No email found. User needs to log in again.");
            return { success: false, message: "No email available for token refresh." };
        }

        const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            let errorMessage = "An error occurred while refreshing the token.";
            const errorData = await response.json();
            errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            return { success: false, message: errorMessage };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Network error while refreshing token:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};

/**
 * Resets the user's password.
 * @param passwordReset - The new password details.
 * @params token - The user's authentication token.
 * @returns A success response or an error message.
 */
export const resetUserPassword = async (token: string, passwordReset: PasswordReset) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(passwordReset),
        });

        if (!response.ok) {
            let errorMessage = "An error occurred while resetting the password.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        return { success: true };
    } catch (error) {
        console.error("Network error while resetting password:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};


/**
 * Deletes the user's account.
 * @returns A success response or an error message.
 */
export const deleteUserAccount = async (token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/delete-account`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }, 
            credentials: "include",

        });

        if (!response.ok) {
            let errorMessage = "Failed to delete account. Please try again.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.errors?.[0] || errorData.detail || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            return { success: false, message: errorMessage };
        }

        return { success: true };
    } catch (error) {
        console.error("Network error while deleting account:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};


/**
 * Sends a verification code to the user's email.
 * @param email - The email address to send the verification code.
 * @returns A success response or an error message.
 */
export const sendEmailVerificationCode = async (email: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/send-verification-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            let errorMessage = "Failed to send verification code. Please try again.";
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
        console.error("Network error while sending verification code:", error);
        return { success: false, message: "A network error occurred. Please check your connection and try again." };
    }
};
