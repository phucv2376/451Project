"use client";
import Link from 'next/link';
import React from "react";
import InputField from '../component/InputField';
import { useRouter } from "next/navigation"; 
import { useState } from 'react';
import { loginUser } from '../services/authService';


const Login = () => {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [message, setMessage] = useState("");
      const [error, setError] = useState("");
      const router = useRouter();

      const handleSubmit = async () =>{  
        try {
            const userData : UserData = { 
              email, 
              password 
            };
            
            const result = await loginUser(userData);
            if(result.success){
              setMessage("Login successful!"); 
              router.push("/dashboard");
              console.log("User logged in:", result);
            }

        } catch (error) {
            setMessage("Login failed.");
        }
      } 

  return (
    <div className="flex justify-center items-center h-dvh w-full bg-gray-200">
      <div className="p-12 w-1/3 h-1/22 bg-white rounded-lg shadow-md">
        <p className="text-left text-4xl text-gray-800 font-serif font-bold mb-4">Sign in</p>
        <p className="display: inline text-left text-gray-800 text-md">Need an account? </p>
        <Link href="/registerPage" className="text-blue-500 underline">Create an account</Link>
        <div className="flex flex-col mt-6">
          <div className='mb-3'>
            <InputField
              label="Email"
              type="email"
              id="emailInput"
              onChange={(e)=> setEmail(e.target.value)}
              error={error}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-left text-black font-sans font-semibold">Password</p>
            <Link href="/forgotPassword" className="text-right text-blue-500 text-sm underline">Forgot your password?</Link>
          </div>
          <input 
            type="password" 
            id="passwordInput" 
            onChange={(e)=> setPassword(e.target.value)}
            className="mt-1 mb-5 block w-full h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ring-gray-300 focus:text-gray-600"
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
              className="mt-12 bg-blue-500 w-1/2 text-white px-6 py-2 rounded-3xl"
              onClick={handleSubmit}
              > 
                Log in
                
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;