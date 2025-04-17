"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  registerNewUser,
  verifyUserEmail,
  loginUserAccount,
  resetUserPassword,
  refreshUserToken,
  sendEmailVerificationCode,
  deleteUserAccount 

} from '../services/authService'; // Import authentication service functions for handling user authentication
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation between pages
import { UserLogin, EmailVerification, UserRegister, PasswordReset } from '../models/auth'; // Import the types for user data models

// AuthContextType defines the structure of the authentication context, including functions and states
interface AuthContextType {
  accessToken: string | null; // Holds the user's access token, which is used for authentication
  registerNewUserAccount: (userRegister: UserRegister) => Promise<{ success: boolean, message: string }>; // Function to register a new user
  verifyUserEmailAddress: (emailVerification: EmailVerification) => Promise<{ success: boolean, message: string }>; // Function to verify the user's email
  sendUserEmailVerificationCode: (email: string) => Promise<{ success: boolean, message: string }>; // Function to send a verification code to the user's email
  login: (userLogin: UserLogin) => Promise<{ success: boolean, message: string }>; // Function to log in an existing user
  ResetPassword: (passwordReset: PasswordReset) => Promise<{ success: boolean, message: string }>; // Function to reset the user's password
  logout: () => void; // Function to log out the current user
  refreshUserAuthToken: () => Promise<void>; // Function to refresh the authentication token
  DeleteAccount: () => Promise<void>; // Function to delete the user's account
}

// Create the AuthContext with the defined AuthContextType to provide authentication-related data
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null); // State to hold the user's access token
  const router = useRouter(); // Use Next.js router for navigation after authentication actions

  // On mount, try to load the token from localStorage
  useEffect(() => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        setAccessToken(storedToken);
      }
  }, []);

  const registerNewUserAccount = async (userRegister: UserRegister) => {
    try {
        const result = await registerNewUser(userRegister); // Call the registerUser function from the authService
        if (result.success) {
            return { success: true, message: result.data.message };
        } else {
            return { success: false, message: result.message }; // Return the error message if registration fails
        }
    } catch (error) {
        return { success: false, message: 'Registration failed. Please try again later.' }; // Return a generic error message if an exception occurs
    }
};

// Function to verify the user's email after registration by calling the verifyEmail service
const verifyUserEmailAddress = async (emailVerification: EmailVerification): Promise<{ success: boolean, message: string }> => {
  try {
      const result = await verifyUserEmail(emailVerification); // Call the verifyEmail function from the authService
      if (result.success) {
          return { success: true, message: result.data.message };
      } else {
          return { success: false, message: result.message || 'An error occurred' }; // Return the error message if email verification fails
      }
  } catch (error) {
      return { success: false, message: 'Email verification failed. Please try again later.' }; // Return a generic error message if an exception occurs
  }
};


// Function to send the email verification code to the user's email
const sendUserEmailVerificationCode = async (email: string) => {
  if (!email) {
    return { success: false, message: "Email is required." }; // Return an error if no email is passed
  }

  try {
    const result = await sendEmailVerificationCode(email); // Call the sendVerificationCode function from the authService

    if (result.success) {
      return { success: true, message: "Verification code sent successfully! Please check your email." }; // Default success message
    } else {
      return { success: false, message: result.message || 'An error occurred' }; // Return failure and message
    }
  } catch (error) {
    return { success: false, message: "An error occurred while sending the verification code." }; // Handle unexpected errors
  }
};

// Function to log in the user by calling the loginUser service
const login = async (userLogin: UserLogin) => {
  try {
    const result = await loginUserAccount(userLogin); // Call the loginUser function from the authService

    if (result.success) {
      const token = result.data.token; // Extract the token from the result
      setAccessToken(token); // Store the token in state for subsequent authenticated requests
      localStorage.setItem("accessToken", token); // Store the token in local storage for persistence
      localStorage.setItem("user", result.data.name); // Store the user data in local storage
      localStorage.setItem("userId", result.data.userId); // Store the user email in local storage
      router.push('/dashboard'); // Redirect to the dashboard page after successful login
      return { success: true, message: result.data.message}; // Return success and message
    } else {
      return { success: false, message: result.message}; // Return failure and message
    }
  } catch (error) {
    return { success: false, message: "An unexpected error occurred. Please try again later." }; // Handle unexpected errors
  }
};

// Function to reset the user's password by calling the resetPassword service
const ResetPassword = async (passwordReset: PasswordReset) => {
  try {
    const result = await resetUserPassword(localStorage.getItem('accessToken') || "", passwordReset); // Call the resetPassword function from the authService

    if (result.success) {
      router.push('/auth/login'); // Redirect to login page after successful password reset
      return { success: true, message: "Password reset successfully! You can now log in with your new password." }; // Default success message
    } else {
      return { success: false, message: result.message || 'An error occurred' }; // Return failure and message
    }
  } catch (error) {
    // Log error to the console (you can also log it to an external service)
    console.error("Error resetting password:", error);
    return { success: false, message: "An error occurred while resetting the password. Please try again later." }; // Return failure and error message
  }
};


  // Function to log out the current user and clear the access token from state
  const logout = () => {
    setAccessToken(null); // Clear the access token from the state
    localStorage.removeItem("accessToken"); // Remove the access token from local storage
    localStorage.removeItem("plaid_access_token"); // Remove the plaid access token from local storage
    localStorage.removeItem("email"); // Remove the email data from local storage
    localStorage.removeItem("user"); // Remove the user data from local storage
    localStorage.removeItem("userId"); // Remove the user email from local storage
    router.push('/auth/login'); // Redirect to the login page
  };

  // Function to refresh the authentication token by calling the refreshTokenAPI service
  const refreshUserAuthToken = async () => {
    try {
      const result = await refreshUserToken(); // Call the refreshTokenAPI function from the authService
      if (result.success) {
        setAccessToken(result.data.token); // Update the access token if the refresh is successful
        localStorage.setItem("accessToken", result.data.token); // Store the new token in local storage
      } else {
        logout(); // Log out the user if the refresh token request fails
      }
    } catch (error) {
      logout(); // Log out the user if an error occurs during token refresh
    }
  };
  
  // Automatically refresh the token every 3 minutes to maintain the user's session
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshUserAuthToken(); // Refresh the token periodically
    }, 1000 * 60 * 20); // 20-minute interval

    return () => clearInterval(interval); // Cleanup the interval when the component unmounts
  }, []);

// Function to delete the user's account by calling the deleteAccount service
const DeleteAccount = async () => {
  if (!accessToken) {
    throw new Error('No access token found. Please log in again.');
  }

  const result = await deleteUserAccount(accessToken); // Pass the access token to the deleteUserAccount service
  if (result.success) {
    setAccessToken(null); // Clear the access token if the account is deleted
    localStorage.removeItem("accessToken"); // Remove the access token from local storage
    router.push('/auth/login'); // Redirect to the login page after account deletion
  } else {
    throw new Error(result.message); // Throw an error if account deletion fails
  }
};

  // Provide the authentication context to the rest of the application
  return (
    <AuthContext.Provider value={{ 
    accessToken, 
    login, 
    logout, 
    refreshUserAuthToken, 
    registerNewUserAccount, 
    verifyUserEmailAddress, 
    DeleteAccount, 
    ResetPassword, 
    sendUserEmailVerificationCode }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext); // Access the AuthContext
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider'); // Ensure the hook is used inside an AuthProvider
  }
  return context; // Return the context value
};
