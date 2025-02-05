"use client";
import Link from 'next/link';

const forgotPassword = () =>{
    return(
        <div className="flex justify-center items-center h-dvh w-full bg-gray-200">
            <div className="p-12 w-1/3 h-1/2 bg-white rounded-lg shadow-md">
                <p>Reset your password</p>
                <p>Enter your email</p>
                <input 
                    type="email" 
                    id="forgotPasswordInput" 
                    className="mt-1 w-full block h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
                />
                <button 
                    className="mt-5 bg-blue-500 w-1/3 text-white px-6 py-2 rounded-3xl"
                >
                    Send link
                </button>
            </div>
        </div>
    )

};

export default forgotPassword;