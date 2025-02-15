"use client";
import Link from 'next/link';
import InputField from '../component/InputField';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCookie } from 'cookies-next/client';
import router from 'next/router';

const forgotPassword = () => {
    useEffect(() => { // Redirect if already logged in
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) router.push("/dashboard");
    }, []);

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");

    const handleSubmit = async () => {

    }

    return (
        <div className="flex h-screen">
            {/* Left Section: Image */}
            <div className="w-full h-full flex justify-center items-end">
                <div className="w-full h-3/4 relative">
                    <Image
                        src="/images/loginImage.jpg" // Path to your image in the public folder
                        alt="Login Background"
                        fill // Makes the image fill the container
                        className="object-contain" // Ensures the image covers the area without distortion
                    />
                </div>
            </div>

            {/* Middle Section: divider */}
            <div className="w-[4px] h-1/2 my-auto bg-gray-200" />

            {/* Right Section: forgot password */}
            <div className="flex justify-start items-center h-dvh w-full">
                <div className="p-12 w-3/4 h-3/4 bg-white ml-10">
                    <p className="text-left text-4xl text-gray-800 font-serif font-bold mb-4">Reset Your Password</p>
                    <p className="display: inline text-left text-gray-800 text-md">Found your password? </p>
                    <Link href="/login" className="text-blue-500 underline">Sign in</Link>
                    <div className="flex flex-col mt-10">
                        <InputField
                            label='Email'
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
                    <div className="flex justify-center">
                        <button
                            className="mt-8 bg-[#8996da] w-1/2 text-white px-6 py-2 
                    rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                            onClick={handleSubmit}
                        >
                            Send link
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
};

export default forgotPassword;