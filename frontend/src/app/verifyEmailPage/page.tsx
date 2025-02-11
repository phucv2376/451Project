"use client";
import Link from 'next/link';
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
//import { verifyEmail } from '../services/authService';


const verifyEmailPage = () =>{
    const [email, setEmail] = useState("");
    const [userCode, setUserCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    // const searchParams = useSearchParams();
   /*  const email = usePathname();
    console.log(email); */
   
    const [codes, setCodes] = useState<string[]>(Array(6).fill("")); // Array to store the verification codes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Refs for each input box

    // console.log(myState);
    const handleChange = (index: number, value: string) => {
        if (/^\d$/.test(value)) { // Allow only single digits
            const newCodes = [...codes];
            newCodes[index] = value;
            setCodes(newCodes);

            // Move focus to the next input box
            if (index < 5 && inputRefs.current[index + 1]) {
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
                inputRefs.current[index - 1]?.focus(); // Move focus to the previous box
            } else if (codes[index]) {
                // If the current box is not empty, clear it
                newCodes[index] = "";
                setCodes(newCodes);
            }
        }
    };

    // Focus the first input box on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleSubmit = async() =>{
        const userData : UserData = { 
            email, 
            userCode 
        };
        
        /* const result = await verifyEmail(userData);
    
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.message);
        } */
    
    };

    return(
        <div className='flex justify-center items-center h-dvh w-full bg-gray-200'>
            <div className="p-12 w-2/5 h-3/5 bg-white rounded-lg shadow-md">
            <p className='text-xl mb-20 font-bold'>A verification code has been sent to {email}!</p>
                <div className="flex flex-col">
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
                                ref={(el) => (inputRefs.current[index] = el)}
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
                            className="mt-5 bg-blue-400 w-1/3 text-white px-6 py-2 rounded-3xl"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default verifyEmailPage;