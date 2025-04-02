"use client";
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import InputField from '../../components/InputField';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { UserRegister, EmailVerification } from '@/app/models/auth';
import PiggyBankAnimation from "../../components/PiggyBankAnimation"; // Import the animation

const Register = () => {
    const { registerNewUserAccount, verifyUserEmailAddress, sendUserEmailVerificationCode } = useAuth();
    const [showVerification, setShowVerification] = useState(false);
    const [code, setUserCode] = useState('');
    const [userRegister, setUserRegister] = useState<UserRegister>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        general: "",
        verificationCode: ""
    });

    const [codes, setCodes] = useState<string[]>(Array(6).fill("")); // Array to store the verification codes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Refs for each input box

    const [verificationCode, setVerificationCode] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // To track processing state
    const [statusMessage, setStatusMessage] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const router = useRouter();

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must include at least one number';
        }
        if (!/[!@$%^&*]/.test(password)) {
            return 'Password must include at least one special character (!@$%^&*)';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must include at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must include at least one lowercase letter';
        }
        return null;
    };

    const validateField = (value: string | undefined, fieldName: string) => {
        if (!value) {
            setErrors(prevErrors => ({ ...prevErrors, [fieldName]: 'This field is required' }));
        } else {
            setErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));
        }
    };

    const handleCodeChange = (index: number, value: string) => {
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
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleSubmit = async () => {
        setIsProcessing(true); // Start processing
        validateField(userRegister.firstName, 'firstName');
        validateField(userRegister.lastName, 'lastName');
        validateField(userRegister.email, 'email');

        const passwordError = validatePassword(userRegister.password || '');
        if (passwordError) {
            setErrors(prevErrors => ({ ...prevErrors, password: passwordError }));
            setIsProcessing(false); // Stop processing
            return;
        }

        if (userRegister.password !== userRegister.confirmPassword) {
            setErrors(prevErrors => ({ ...prevErrors, confirmPassword: 'Passwords do not match' }));
            setIsProcessing(false); // Stop processing
            return;
        }

        try {
            const result = await registerNewUserAccount(userRegister);

            if (result.success) {
                // Show the email verification step after successful registration
                setShowVerification(true);
                setStatusMessage({ message: result.message, type: 'info' });
                setTimeout(() => setStatusMessage(null), 3000); // Clear the message after 5 seconds
            } else {
                setErrors(prevErrors => ({ ...prevErrors, general: result.message }));
            }
        } catch (error) {
            setErrors(prevErrors => ({ ...prevErrors, general: 'Registration failed.' }));
        } finally {
            setIsProcessing(false); // Stop processing
        }
    };

    const handleVerificationSubmit = async (code: string) => {
        setVerificationCode(code);
        setErrors(prevErrors => ({ ...prevErrors, verificationCode: '' }));

        // Prepare EmailVerification object
        const emailVerification: EmailVerification = {
            email: userRegister.email,
            code: code
        };

        // Call the backend to verify the email using the verification code
        try {
            setIsProcessing(true); // Start processing verification
            const result = await verifyUserEmailAddress(emailVerification);
            if (result.success) {
                // Show spinner with success message
                setStatusMessage({ message: result.message, type: 'success' });

                // Wait for 3 seconds before redirecting
                setTimeout(() => {
                    router.push("/auth/login"); // Redirect to login page
                }, 1000);
            } else {
                setErrors(prevErrors => ({ ...prevErrors, verificationCode: result.message }));
            }
        } catch (error) {
            setErrors(prevErrors => ({ ...prevErrors, verificationCode: 'Verification failed. Please try again.' }));
        } finally {
            setIsProcessing(false); // Stop processing verification
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setStatusMessage({ message: "Resending verification code...", type: 'info' });

        try {
            await sendUserEmailVerificationCode(userRegister.email); // Pass the email to resend the verification code
            setStatusMessage({ message: 'Verification code resent. Please check your inbox.', type: 'success' });
            setTimeout(() => setStatusMessage(null), 2000); // Clear the message after 5 seconds
        } catch (error) {
            setStatusMessage({ message: 'Failed to resend verification code.', type: 'error' });
            setTimeout(() => setStatusMessage(null), 2000); // Clear the message after 5 seconds
        } finally {
            setIsResending(false);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserRegister(prevUserInfo => {
            const updatedUserInfo = { ...prevUserInfo, [name]: value };
            return updatedUserInfo;
        });

        // Clear field-specific errors when user types
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: name === "password" ? validatePassword(value) || "" : "", // Revalidate password dynamically
            confirmPassword:
                name === "confirmPassword" && value !== userRegister.password
                    ? "Passwords do not match"
                    : ""
        }));
    };

    return (
        <div className="flex flex-col md:flex-row h-screen">
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

            {/* Middle Section: divider */}
            <div className="hidden md:block w-[2px] h-1/2 my-auto bg-gray-200" />

            {/* Right Section: registration and email verification */}
            <div className="flex justify-center items-center w-full md:w-1/2 h-2/3 md:h-dvh">
                <div className="p-6 md:p-12 w-full md:w-3/4 h-full md:h-3/4 bg-white md:ml-10">
                    <p className="text-left text-2xl md:text-4xl text-gray-800 font-serif font-bold mb-4">Create an account</p>
                    <p className="inline-block text-left text-gray-800 md:text-md">Have an account? </p>
                    <Link href="/auth/login" className="ml-2 text-blue-500 underline">Sign in</Link>
                    <div className="flex flex-col mt-4">
                        <div className='flex flex-col md:flex-row'>
                            <div className="flex-1 md:mr-1">
                                <InputField
                                    label="First Name"
                                    type="text"
                                    id="firstNameInput"
                                    name="firstName"
                                    onChange={handleChange}
                                    error={errors.firstName}
                                />
                            </div>
                            <div className="flex-1 md:ml-1">
                                <InputField
                                    label="Last Name"
                                    type="text"
                                    id="lastNameInput"
                                    name="lastName"
                                    onChange={handleChange}
                                    error={errors.lastName}
                                />
                            </div>
                        </div>
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
                        <InputField
                            label="Confirm Password"
                            type="password"
                            id="confirmPasswordInput"
                            name="confirmPassword"
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />
                        <div className="flex justify-center">
                            <button
                                className="mt-5 bg-[#8996da] w-full md:w-1/2 text-white px-6 py-2 
                                rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                                onClick={handleSubmit}
                                disabled={isProcessing} // Disable the button when processing
                            >
                                {isProcessing ? 'Processing...' : 'Register'}
                            </button>
                        </div>
                        {errors.general && <p className="text-red-500 mt-4">{errors.general}</p>}
                    </div>

                    {/* Email Verification Modal */}
                    {showVerification && (
                        <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                            <div className="w-1/2 md:w-1/3 p-6 md:p-8 bg-white rounded-xl">
                                <p className="mb-4 font-bold text-lg">Please verify your email address</p>
                                <p className='flex justify-center mb-2'>Verification Code</p>
                                <div className="flex justify-center gap-4">
                                    {codes.map((code, index) => (
                                        <input
                                            key={index}
                                            tabIndex={0}
                                            type="text"
                                            value={code}
                                            maxLength={1}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
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
                                {/* <InputField
                                    label="Verification Code"
                                    type="text"
                                    id="verificationCodeInput"
                                    name="verificationCode"
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    error={errors.verificationCode}
                                /> */}
                                <p className='text-red-600'>{errors.verificationCode}</p>
                                <div className="flex justify-center space-x-4 mt-5">
                                    <button
                                        className="bg-[#8996da] w-1/3 text-white px-6 py-2 
                                            rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                                        onClick={() => handleVerificationSubmit(codes.join(''))}
                                        disabled={isProcessing} // Disable the button during verification
                                    >
                                        {isProcessing ? 'Verifying...' : 'Verify'}
                                    </button>

                                    <button
                                        className="border-2 border-[#8996da] text-[#8996da] px-6 py-2 rounded-lg bg-transparent 
                                        hover:bg-[#6a7fcb] hover:text-white hover:shadow-lg transition-all duration-300"                                        onClick={() => setShowVerification(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {isResending ? (
                                    <div className="flex justify-center mt-4">
                                        <div className="spinner"></div>
                                    </div>
                                ) : (
                                    <button
                                        className="mt-4 text-blue-500"
                                        onClick={handleResendCode}
                                    >
                                        Resend verification code
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Spinner with success message 
                    {isProcessing && (
                        <Spinner message={statusMessage?.type === 'success' ? statusMessage.message : undefined} />
                    )}*/}
                    {isProcessing && <PiggyBankAnimation />}

                    {statusMessage && !isProcessing && (
                        <div
                            className={`mt-4 text-center ${statusMessage.type === 'success'
                                ? 'text-green-500'
                                : statusMessage.type === 'error'
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                                }`}
                        >
                            {statusMessage.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;