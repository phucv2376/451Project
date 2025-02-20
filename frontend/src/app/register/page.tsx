"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { registerUser } from '../services/authService';
import { useRouter } from "next/navigation";
import InputField from '../component/InputField';
import Image from 'next/image';
import { UserInfo } from '@/app/types/UserInfo';

const Register = () => {
    useEffect(() => { // Redirect if already logged in
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) router.push("/dashboard");
    }, []);

    const [userInfo, setUserInfo] = useState<UserInfo>({
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
        general: ""
    });

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

        return null;
    };

    const validateField = (value: string | undefined, fieldName: string) => {
        if (!value) {
            setErrors(prevErrors => ({ ...prevErrors, [fieldName]: 'This field is required' }));
        } else {
            setErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));
        }
    };

    const handleSubmit = async () => {
        validateField(userInfo.firstName, 'firstName');
        validateField(userInfo.lastName, 'lastName');
        validateField(userInfo.email, 'email');

        const passwordError = validatePassword(userInfo.password || '');
        if (passwordError) {
            setErrors(prevErrors => ({ ...prevErrors, password: passwordError }));
            return;
        }

        if (userInfo.password !== userInfo.confirmPassword) {
            setErrors(prevErrors => ({ ...prevErrors, confirmPassword: 'Passwords do not match' }));
            return;
        }

        try {
            const result = await registerUser(userInfo);

            console.log(result)
            if (result.success) {
                // Send verification code after successful registration
                //const verificationSent = await sendVerificationCode(email);

                //if (verificationSent.success) {
                //router.push('/verifyEmailPage'); // Redirect to verification page
                router.push(`/verifyEmail?email=${btoa(userInfo.email)}`);
                //router.push(`/verifyEmailPage?email`);
                console.log("User registered:", result);
                /* } else {
                    setError('Failed to send verification code. Please try again.');
                    //redirect to error page?
                } */
            } else {
                setErrors(prevErrors => ({ ...prevErrors, general: result.message }));
            }
        } catch (error) {
            setErrors(prevErrors => ({ ...prevErrors, general: 'Registration failed.' }));
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserInfo(prevUserInfo => {
            const updatedUserInfo = { ...prevUserInfo, [name]: value };
            console.log("Updated State:", updatedUserInfo); // Logs the latest state correctly
            return updatedUserInfo;
        });

        // Clear field-specific errors when user types
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: name === "password" ? validatePassword(value) || "" : "", // Revalidate password dynamically
            confirmPassword:
                name === "confirmPassword" && value !== userInfo.password
                    ? "Passwords do not match"
                    : ""
        }));
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
                                    name="firstName"
                                    onChange={handleChange}
                                    error={errors.firstName}
                                />
                            </div>
                            <div className="flex-1 ml-1">
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
                                className="mt-5 bg-[#8996da] w-1/2 text-white px-6 py-2 
                                rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
                                onClick={handleSubmit}
                            >
                                Register
                            </button>
                        </div>
                        {errors.general && <p className="text-red-500 mt-4">{errors.general}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 