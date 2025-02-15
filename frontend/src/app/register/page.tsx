"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { registerUser } from '../services/authService';
//import { sendVerificationCode } from '../services/authService';
import { useRouter } from "next/navigation";
import InputField from '../component/InputField';
import Image from 'next/image';
import { getCookie } from 'cookies-next/client';



const Register = () => {
    useEffect(() => { // Redirect if already logged in
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) router.push("/dashboard");
    }, []);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const router = useRouter();

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }

        if (!/[0-9]/.test(password)) {
            return 'Password must include at least one number';
        }

        if (!/[!@#$%^&*]/.test(password)) {
            return 'Password must include at least one special character (!@#$%^&*)';
        }

        if (!/[A-Z]/.test(password)) {
            return 'Password must include at least one uppercase letter';
        }

        if (!/[a-z]/.test(password)) {
            return 'Password must include at least one lowercase letter';
        }

        // If all checks pass, return null (no error)
        return null;
    };

    const validateField = (value: string, setError: (message: string) => void) => {
        if (value === '') {
            setError('This field is required');

        } else {
            setError('');
        }
    };

    const handleSubmit = async () => {
        validateField(firstName, setFirstNameError);
        validateField(lastName, setLastNameError);
        validateField(email, setEmailError);

        const passwordError = validatePassword(password);
        if (passwordError) {
            setPasswordError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }

        try {
            const userData: UserData = {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
            };
            const result = await registerUser(userData);

            if (result.success) {
                // Send verification code after successful registration
                //const verificationSent = await sendVerificationCode(email);

                //if (verificationSent.success) {
                //router.push('/verifyEmailPage'); // Redirect to verification page
                router.push(`/verifyEmail?email=${btoa(email)}`);
                //router.push(`/verifyEmailPage?email`);
                console.log("User registered:", result);
                /* } else {
                    setError('Failed to send verification code. Please try again.');
                    //redirect to error page?
                } */
            } else {

                setError('Registration failed. Please try again.');
            }
        } catch (error) {
            setError("Registration failed.");
        }
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
        if (event.target.value.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
        } else {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value);
        if (confirmPasswordError) {
            setConfirmPasswordError('');
        }
    };

    const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
        if (firstNameError) {
            setFirstNameError('');
        }

    };

    const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value);
        if (lastNameError) {
            setLastNameError('');
        }
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        if (emailError) {
            setEmailError('');
        }
    };

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

            {/* Right Section: login */}
            <div className="flex justify-start items-center h-dvh w-full">
                <div className="p-12 w-3/4 h-3/4 bg-white ml-10">
                    <p className="text-left text-4xl text-gray-800 font-serif font-bold mb-4">Create an account</p>
                    <p className="display: inline text-left text-gray-800 text-md">Have an account? </p>
                    <Link href="/login" className="text-blue-500 underline">Sign in</Link>
                    <div className="flex flex-col mt-4">
                        <div className='flex'>
                            <div className="flex-1 mr-1">
                                <InputField
                                    label="First Name"
                                    type="text"
                                    id="firstNameInput"
                                    onChange={handleFirstNameChange}
                                    error={firstNameError}
                                />
                            </div>
                            <div className="flex-1 ml-1">
                                <InputField
                                    label="Last Name"
                                    type="text"
                                    id="lastNameInput"
                                    onChange={handleLastNameChange}
                                    error={lastNameError}
                                />
                            </div>
                        </div>
                        <InputField
                            label="Email"
                            type="email"
                            id="emailInput"
                            onChange={handleEmailChange}
                            error={emailError}
                        />
                        <InputField
                            label="Password"
                            type="password"
                            id="passwordInput"
                            onChange={handlePasswordChange}
                            error={passwordError}
                        />
                        <InputField
                            label="Confirm Password"
                            type="password"
                            id="confirmPasswordInput"
                            onChange={handleConfirmPasswordChange}
                            error={confirmPasswordError}
                        />
                        <div className="flex justify-center">
                            <button
                                className="mt-5 bg-[#8996da] w-1/2 text-white px-6 py-2 
                                rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                                onClick={handleSubmit}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 