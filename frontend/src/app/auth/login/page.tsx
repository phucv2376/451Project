"use client";
import Link from 'next/link';
import Image from 'next/image';
import InputField from '../../components/InputField';
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserLogin } from '../../models/auth';
import PiggyBankAnimation from "../../components/PiggyBankAnimation"; // Import the animation

const Login = () => {

    // State variables
    const [message, setMessage] = useState<string>("");
    const [errors, setErrors] = useState<{ email: string; password: string }>({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState<boolean>(false);

    // Auth context for authentication functions
    const { login } = useAuth();
    // User login state
    const [userLogin, setUserInfo] = useState<UserLogin>({
        email: "",
        password: "",
    });

    // Redirect if already logged in
   useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            router.push("/dashboard");
        }
    }, [router]);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    if (!isMounted) {
        return null;
    }

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

        // Prevent submission if validation fails
        if (hasError) return;

        // Set loading state
        setIsLoading(true);
        try {
            const response = await login(userLogin);

            if (!response.success) {
                setMessage(response.message);
                return;
            }

            router.push("/dashboard");
        } catch (error) {
            setMessage(`An unexpected error occurred. Please try again.${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Input change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({ ...prevUserInfo, [name]: value }));

        if (name === "email" && value !== "") {
            setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
        }
        if (name === "password" && value !== "") {
            setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen relative">
            {/* Loading Animation */}
            {isMounted && isLoading && <PiggyBankAnimation />}

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
            <div className="hidden md:block w-[2px] h-1/2 my-auto bg-gray-200" />

            {/* Right Section: Login */}
            <div className="flex justify-center items-center h-full w-full md:w-1/2 p-6">
                <div className="w-full max-w-md p-8 bg-white">
                    <p className="text-left text-3xl md:text-4xl text-gray-800 font-serif font-bold mb-4">Sign in</p>
                    <p className="inline text-left text-gray-800 text-md">Need an account? </p>
                    <Link href="/auth/register" className="text-blue-500 underline">Create an account</Link>

                    {/* Form Fields */}
                    <form className="flex flex-col mt-6" onSubmit={handleSubmit}>
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <span className="ml-2 text-gray-700">Remember Me</span>
                        </label>

                        {/* Submit Button */}
                        <div className='flex justify-center'>
                        <button
                            type="submit"
                            className="mt-5 bg-[#8996da] w-full md:w-1/2 text-white px-6 py-2 
                            rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"    
                        >
                            Sign In
                        </button>
                        </div>
                        {/* Display error messages */}
                        {message && <p className="mt-3 text-red-500">{message}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;