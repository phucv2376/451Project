"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { verifyEmail } from '../services/authService';
import { useSearchParams } from 'next/navigation';
import { getCookie } from "cookies-next/client";


const verifyEmailPage = () => {
    useEffect(() => { // Redirect if already logged in
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) router.push("/dashboard");
      }, []);

    const [email, setEmail] = useState("");
    const [code, setUserCode] = useState('');
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    const [codes, setCodes] = useState<string[]>(Array(6).fill("")); // Array to store the verification codes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Refs for each input box

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(atob(emailParam));
        }
    }, [searchParams]);

    console.log(email);

    const handleChange = (index: number, value: string) => {
        if (/^\d$/.test(value)) { // Allow only single digits
            const newCodes = [...codes];
            newCodes[index] = value;
            setCodes(newCodes);
            setUserCode(newCodes.join(""));

            if (index < 5 && inputRefs.current[index + 1]) {// Move focus to the next input box
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle backspace key
    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace") {
            const newCodes = [...codes];
            if (index > 0 && !codes[index]) {
                // If the current box is empty, clear the previous box
                newCodes[index - 1] = "";
                setCodes(newCodes);
                setUserCode(newCodes.join(""));

                inputRefs.current[index - 1]?.focus(); // Move focus to the previous box
            } else if (codes[index]) {
                // If the current box is not empty, clear it
                newCodes[index] = "";
                setCodes(newCodes);
                setUserCode(newCodes.join(""));

            }
        }
    };

    // Focus the first input box on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleSubmit = async () => {
        const userData: UserData = {
            email,
            code
        };

        const result = await verifyEmail(userData);

        if (result.success) {
            router.push('/login');
        } else {
            setError(result.message);
        }

    };

    return (

        <div className="flex h-screen">
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
            <div className="flex justify-start items-center h-dvh w-full">
                <div className="p-12 w-3/4 h-3/4 bg-white ml-10">
                <p className="text-left text-4xl text-gray-800 font-serif font-bold mb-7">Verify Email Address</p>
                <p className="display: inline text-left text-gray-800 text-md">Please enter the verification code sent to {email}</p>
                <div className="flex flex-col mt-3">
                    <div className="flex justify-center gap-4">
                        {codes.map((code, index) => (
                            <input
                                key={index}
                                tabIndex={0}
                                type="text"
                                value={code}
                                maxLength={1}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                style={{
                                    width: "40px",
                                    height: "50px",
                                    textAlign: "center",
                                    fontSize: "18px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                }}
                            />
                        ))}
                    </div>
                    <div className='flex justify-center mt-10'>
                        <button
                            className="mt-6 bg-[#8996da] w-1/2 text-white px-6 py-2 
                            rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default verifyEmailPage;