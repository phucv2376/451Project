"use client";
import Link from 'next/link';
import { useState } from 'react';
import { registerUser } from '../services/authService';
//import { sendVerificationCode } from '../services/authService';
import { useRouter } from "next/navigation"; 
import InputField from '../component/InputField';


const Register = () => {
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

    const handleSubmit = async () =>{ 
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }
        
        try {
            const userData : UserData = { 
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
                    router.push(`/verifyEmailPage?email=${encodeURIComponent(email)}`);
                    //router.push(`/verifyEmailPage?email`);
                    console.log("User registered:", result);
                /* } else {
                    setError('Failed to send verification code. Please try again.');
                    //redirect to error page?
                } */
            } else {
                validateField(firstNameError, setFirstNameError);
                validateField(lastNameError, setLastNameError);
                validateField(emailError, setEmailError);
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
        if(lastNameError){
            setLastNameError('');
        }
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        if(emailError){
            setEmailError('');
        }
    };

    const validateField = (value: string, setError: (message: string) => void) => {
        if (value === '') {
          setError('This field is required');
          
        } else {
          setError('');
        }
    };

    return (
        <div className="flex justify-center items-center h-dvh w-full bg-gray-200">
            <div className="p-12 w-2/5 h-9/10 bg-white rounded-lg shadow-md">
                <p className="text-left text-4xl text-gray-800 font-serif font-bold mb-4">Create an account</p>
                <p className="display: inline text-left text-gray-800 text-md">Have an account? </p>
                <Link href="/loginPage" className="text-blue-500 underline">Sign in</Link>
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
                            className="mt-5 bg-blue-500 w-1/2 text-white px-6 py-2 rounded-3xl"
                            onClick={handleSubmit}
                        >
                            Register
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
    
export default Register; 