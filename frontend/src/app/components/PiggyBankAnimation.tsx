"use client";
import { useState, useEffect } from "react";

const PiggyBankAnimation = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="flex justify-center items-center fixed top-0 left-0 w-full h-full bg-white bg-opacity-70 z-50">
            <div className="flex flex-col justify-center items-center">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-[100px] w-[100px]"
                >
                    <source src="/images/piggy-bank.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
};

export default PiggyBankAnimation;
