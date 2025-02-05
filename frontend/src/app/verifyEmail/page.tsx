"use client";
import Link from 'next/link';
import React from "react";
import { useState, useRef, useEffect } from "react";

const verifyEmail = () =>{
    const [codes, setCodes] = useState<string[]>(Array(6).fill("")); // Array to store the verification codes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Refs for each input box

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

    // Handle backspace key, doesnt work when all boxes are filled
    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && index > 0 && !codes[index]) {
            const newCodes = [...codes];
            newCodes[index - 1] = ""; // Clear the previous box
            setCodes(newCodes);
            inputRefs.current[index - 1]?.focus(); // Move focus to the previous box
        }
    };
 

    // Focus the first input box on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    return(
        <div className='flex justify-center items-center h-dvh w-full bg-gray-200'>
            <div className="flex justify-center items-center p-12 w-1/3 h-1/2 bg-white rounded-lg shadow-md">
                <div style={{ display: "flex", gap: "10px" }}>
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
                                height: "40px",
                                textAlign: "center",
                                fontSize: "18px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                            }}
                        />
                    ))}
                </div>
                <button className='w-1/3 bg-blue-200 m-2'>Button</button>
            </div>
        </div>
    );
};

export default verifyEmail;