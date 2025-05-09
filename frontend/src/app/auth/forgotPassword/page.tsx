"use client";
import Link from 'next/link';
import InputField from '../../components/InputField';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useAuth } from './../../contexts/AuthContext'; // Import authentication context
import { PasswordReset } from './../../models/auth'; // Import PasswordReset interface

const ForgotPassword = () => {
    // Get the ResetPassword function from authentication context
    const { ResetPassword } = useAuth();
    const router = useRouter();

    // State variables for form fields
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [message, setMessage] = useState(""); // Message for errors or success
    const [isLoading, setIsLoading] = useState(false); // Loading state for submit button
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);
    
    if (!isMounted) {
        return null;
    }

    // Function to handle form submission
    const handleSubmit = async () => {
        // Basic validation to ensure all fields are filled
        if (!email || !newPassword || !newConfirmPassword) {
            setMessage("Please fill in all fields.");
            return;
        }

        // Check if new passwords match
        if (newPassword !== newConfirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true); // Show loading state during API call
        const passwordReset: PasswordReset = { 
            email, 
            newPassword, 
            confirmNewPassword: newConfirmPassword 
        }; // Construct the password reset object

        try {
            // Call the reset password function from the Auth context
            const result = await ResetPassword(passwordReset);
            if (result.success) {
                setMessage(result.message); // Display success message
                router.push("/auth/login"); // Redirect user to login page
            } else {
                setMessage(result.message); // Display error message from backend
            }
        } catch (error) {
            setMessage(`An error occurred. Please try again later${error}.`);
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen">
            {/* Left Section: Image */}
            <div className="w-full h-full flex justify-center items-center md:w-1/2">
                <div className="w-full h-3/4 relative">
                    <Image
                        src="/images/loginImage.jpg"
                        alt="Login Background"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
            </div>

            {/* Middle Section: Divider line */}
            <div className="w-[4px] lg:h-1/2 h-[1px] my-auto bg-gray-200" />

            {/* Right Section: Password reset form */}
            <div className="flex justify-center lg:justify-start items-center h-full lg:h-dvh w-full">
                <div className="p-6 lg:p-12 w-full lg:w-3/4 h-full lg:h-3/4 bg-white mx-4 lg:ml-10">
                    {/* Page Title */}
                    <p className="text-center lg:text-left text-2xl lg:text-4xl text-gray-800 font-serif font-bold mb-4">
                        Reset Your Password
                    </p>

                    {/* Navigation link to login page */}
                    <p className="text-center lg:text-left text-gray-800 text-md">
                        Found your password?  
                        <Link href="/auth/login" className="text-blue-500 underline"> Sign in</Link>
                    </p>

                    {/* Input fields for password reset */}
                    <div className="flex flex-col mt-8 lg:mt-10">
                        <InputField
                            label="Email"
                            type="email"
                            id="emailInput"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputField
                            label="New Password"
                            type="password"
                            id="newPasswordInput"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <InputField
                            label="Confirm New Password"
                            type="password"
                            id="confirmNewPasswordInput"
                            onChange={(e) => setNewConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* Display success or error message */}
                    {message && <p className="text-red-500 mt-2">{message}</p>}

                    {/* Submit button */}
                    <div className="flex justify-center mt-6 lg:mt-8">
                        <button
                            className="bg-[#8996da] w-1/2 lg:w-1/3 text-white px-6 py-2 
                            rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
