import API_BASE_URL from "@/app/config";

export const registerUser = async (userData: UserData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Register`, {
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
            return { success: false, message: errorData.message || "Registration failed. Please try again." };
        }
    } catch (error) {
        console.error("Error during registration:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
};

//sendVerificationCode function removed temporarily
//verifyEmail function removed temporarily


export const loginUser = async(userData : UserData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/Login`, {
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
            return { success: false, message: errorData.message || "Login failed. Please try again." };
        }

    } catch (error) {
        console.error("Error logging in:", error);
        return { success: false, message: "An error occurred. Please try again." };
    }
}