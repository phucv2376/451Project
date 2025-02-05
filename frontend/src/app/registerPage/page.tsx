"use client";
import Link from 'next/link';
import { useState } from 'react';
import { registerUser } from '../services/authService';
import { useRouter } from "next/navigation"; 


const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    
    const router = useRouter();

    const handleSubmit = async () =>{  
        try {
            const userData : UserData = { 
                firstName, 
                lastName, 
                email, 
                password, 
                confirmPassword,
            };
            const result = await registerUser(userData);
            setMessage("Registration successful!");
            router.push("/verifyEmail"); //still redirecting even if not successful
            console.log("User registered:", result);
        } catch (error) {
            setMessage("Registration failed.");
        }
    }

    return (
        <div className="flex justify-center items-center h-dvh w-full bg-gray-200">
            <div className="p-12 w-1/3 h-9/10 bg-white rounded-lg shadow-md">
                <p className="text-left text-4xl text-gray-800 font-serif font-bold mb-4">Create an account</p>
                <p className="display: inline text-left text-gray-800 text-md">Have an account? </p>
                <Link href="/loginPage" className="text-blue-500 underline">Sign in</Link>
                <div className="flex flex-col mt-4">
                    <div className='flex mb-3'>
                        <div className="flex-1 mr-1">
                            <span className="text-black font-sans font-semibold">First Name</span>
                            <input 
                                type="text" 
                                id="firstNameInput" 
                                onChange={(e)=> setFirstName(e.target.value)}
                                className="mt-1 w-full block h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
                            />
                        </div>
                        <div className="flex-1 ml-1">
                            <span className="text-black font-sans font-semibold">Last Name</span>
                            <input 
                                type="text" 
                                id="lastNameInput" 
                                onChange={(e)=> setLastName(e.target.value)}
                                className=" mt-1 w-full block h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
                            />
                        </div>
                    </div>
                    <p className="text-black font-sans font-semibold">Email</p>
                    <input 
                        type="email" 
                        id="emailInput" 
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 mb-3 w-full block h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
                    />
                    <p className="text-left text-black font-sans font-semibold">Password</p>
                    <input 
                        type="password" 
                        id="passwordInput" 
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 mb-3 block w-full h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
                    />
                    <p className="text-left text-black font-sans font-semibold">Confirm Password</p>
                    <input 
                        type="password" 
                        id="confirmPasswordInput" 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 mb-4 block w-full h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
                    />
                    <label className="flex items-center cursor-pointer relative">
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
                    <div className="flex justify-center">
                        <button 
                            className="mt-5 bg-blue-500 w-1/2 text-white px-6 py-2 rounded-3xl"
                            onClick={handleSubmit}
                        >
                            Register
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
    
export default Register; 