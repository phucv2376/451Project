"use client";
import Link from 'next/link';
import Image from 'next/image';
import InputField from '../../components/InputField';
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserLogin } from '../../models/auth';

// Spinner component for loading state during login
const Spinner = () => (
    <div className="flex justify-center items-center absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 z-50">
        <div className="relative">
            <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-medium text-gray-600">Loading...</span>
        </div>
    </div>
);

const Login = () => {
    // State for handling form data, errors, and loading state
    const [message, setMessage] = useState<string>("");
    const [errors, setErrors] = useState<{ email: string; password: string }>({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    
    // Auth context for access token and login function
    const { accessToken, login, verifyUserEmailAddress, sendUserEmailVerificationCode } = useAuth();

    // State for storing user information
    const [userLogin, setUserInfo] = useState<UserLogin>({
        email: "",
        password: "",
    });

    // Redirect to dashboard if already logged in (accessToken present)
    useEffect(() => {
        if (accessToken) {
            router.push("/dashboard");
        }
    }, [accessToken, router]);
    
    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        let hasError = false;
        const newErrors = { email: "", password: "" };
    
        // Validate user input
        if (!userLogin.email) {
            newErrors.email = "Email is required.";
            hasError = true;
        }
        if (!userLogin.password) {
            newErrors.password = "Password is required.";
            hasError = true;
        }
    
        setErrors(newErrors);
    
        // If there are errors, prevent submission
        if (hasError) return;
    
        // Set loading state and simulate login delay
        setIsLoading(true);
        setTimeout(async () => {
            try {
                // Attempt login
                const response = await login(userLogin);
                
                // Check if backend response includes an error message
                if (!response.success) {
                    setMessage(response.message); // Use the error message from the backend
                    return;
                }
    
                // Redirect if login is successful
                router.push("/dashboard");
            } catch (error) {
                // Fallback error handling
                setMessage("An unexpected error occurred. Please try again.");
            } finally {
                // Reset loading state
                setIsLoading(false);
            }
        }, 2000); // Delay for 2 seconds
    };
    

    // Input change handler for updating userInfo state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            [name]: value,
        }));

        // Clear error messages when input is filled
        if (name === "email" && value !== "") {
            setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
        }
        if (name === "password" && value !== "") {
            setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen">
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

            {/* Divider */}
            <div className="hidden md:block w-[4px] h-1/2 my-auto bg-gray-200" />

            {/* Right Section: Login */}
            <div className="flex justify-center items-center h-full w-full md:w-1/2 p-6">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                    <p className="text-left text-3xl md:text-4xl text-gray-800 font-serif font-bold mb-4">Sign in</p>
                    <p className="inline text-left text-gray-800 text-md">Need an account? </p>
                    <Link href="/auth/register" className="text-blue-500 underline">Create an account</Link>

                    {/* Form Fields */}
                    <div className="flex flex-col mt-6">
                        <InputField
                            label="Email"
                            type="email"
                            id="emailInput"
                            name="email"
                            onChange={handleChange}
                            error={errors.email}
                        />
                        <InputField
                            label="Password"
                            type="password"
                            id="passwordInput"
                            name="password"
                            onChange={handleChange}
                            error={errors.password}
                        />
                        <Link href="/auth/forgotPassword" className="text-right text-blue-500 text-sm underline">Forgot your password?</Link>
                        
                        {/* Remember Me Checkbox */}
                        <label className="flex items-center cursor-pointer relative mt-4">
                            <input
                                type="checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-slate-800 checked:border-slate-800 transition-all shadow hover:shadow-md"
                                id="ripple-off"
                            />
                            <span className="absolute left-0 top-0 h-5 w-5 flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 text-white"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                            <span className="ml-3 text-slate-600 text-sm">Keep me logged in</span>
                        </label>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                className="mt-6 bg-[#8996da] w-full md:w-1/2 text-white px-6 py-2 rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner /> : "Log in"}
                            </button>
                        </div>

                        {/* Error Message */}
                        {message && <p className="text-red-500 mt-4">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
