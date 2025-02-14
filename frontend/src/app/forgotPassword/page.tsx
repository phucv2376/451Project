"use client";
import Link from 'next/link';
import InputField from '../component/InputField';
import { useRouter } from "next/navigation"; 
import { useState } from 'react';

const forgotPassword = () =>{
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");

    const handleSubmit = async() =>{

    }

    return(
        <div className="flex justify-center items-center h-dvh w-full bg-gray-200">
            <div className="p-12 w-1/3 h-3/4 bg-white rounded-lg shadow-md">
                <p className='text-lg mb-2'>Reset your password</p>
                <p>Enter your email</p>
                <InputField
                    label='Email'
                    type="email"
                    id="emailInput"
                    onChange={(e)=> setEmail(e.target.value)}
                />
                <InputField
                    label="New Password"
                    type="password"
                    id="newPasswordInput"
                    onChange={(e)=> setNewPassword(e.target.value)}
                />
                <InputField
                    label="Confirm New Password"
                    type="password"
                    id="confirmNewPasswordInput"
                    onChange={(e)=> setNewConfirmPassword(e.target.value)}
                />
                <button 
                    className="mt-8 bg-[#8996da] w-1/2 text-white px-6 py-2 
                    rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                    onClick={handleSubmit}
                >
                    Send link
                </button>
            </div>
        </div>
    )
};

export default forgotPassword;