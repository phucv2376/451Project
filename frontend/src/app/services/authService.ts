import API_BASE_URL from "@/app/config";
import { setCookie, getCookie } from "cookies-next/client";


export const registerUser = async (userData: UserData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.errors[0]};
        }
    } catch (error) {
        console.error("Error during registration:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
};

export const verifyEmail = async (userData : UserData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send email and code in the request body
      });
  
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Verification failed. Please try again." };
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, message: "An error occurred. Please try again." };
    }
};

export const loginUser = async(userData : UserData) => {
    'use client';
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const data = await response.json();
            // Store tokens & email in localStorage
            localStorage.setItem("email", userData.email);
            localStorage.setItem("accessToken", data.token);
            setCookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
            return { success: true, data };
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.errors[0] };
        }
    } catch (error) {
        console.error("Error logging in:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
};

export const isAuthenticated = () => {
    return getCookie("accessToken");
}