"use client";
import Link from 'next/link';
import InputField from '../component/InputField';
import { useRouter } from "next/navigation";

import { useState, useEffect } from 'react';
import { loginUser } from '../services/authService';
import Image from 'next/image';
import { UserInfo } from '@/app/types/UserInfo';

const Login = () => {
	useEffect(() => { // Redirect if already logged in
		const accessToken = localStorage.getItem("accessToken");
		if (accessToken) router.push("/dashboard");
	}, []);

	const [message, setMessage] = useState("");
	const [errors, setErrors] = useState({ email: "", password: "" });
	const router = useRouter();

	const [userInfo, setUserInfo] = useState<UserInfo>({
        email: "",
        password: "",
    });

	const handleSubmit = async () => {
		let hasError = false;
		const newErrors = { email: "", password: "" };

		if (!userInfo.email) {
			newErrors.email = "Email is required.";
			hasError = true;
		}
		if (!userInfo.password) {
			newErrors.password = "Password is required.";
			hasError = true;
		}

		setErrors(newErrors);

		if (hasError) return;

		try {
			const user: UserInfo = {
				email: userInfo.email,
				password: userInfo.password
			};

			const result = await loginUser(userInfo);
			if (result.success) {
				setMessage("Login successful!");
				router.push("/dashboard");
				console.log("User logged in:", result);
			} else {
				setMessage("Incorrect username or password.");
			}
		} catch (error) {
			setMessage("Login failed.");
		}
	}

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserInfo(prevUserInfo => {
            const updatedUserInfo = { ...prevUserInfo, [name]: value };
            return updatedUserInfo;
        });
		if (userInfo.email != "") {
			setErrors({ ...errors, email: "" });
		}
		if (userInfo.password != "") {
			setErrors({ ...errors, password: "" });
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
					<p className="text-left text-4xl text-gray-800 font-serif font-bold mb-4">Sign in</p>
					<p className="display: inline text-left text-gray-800 text-md">Need an account? </p>
					<Link href="/register" className="text-blue-500 underline">Create an account</Link>
					<div className="flex flex-col mt-6">
						<div>
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
						</div>
						<Link href="/forgotPassword" className="text-right text-blue-500 text-sm underline">Forgot your password?</Link>
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
								className="mt-12 bg-[#8996da] w-1/2 text-white px-6 py-2 
                rounded-3xl hover:bg-[#6a7fcb] hover:shadow-lg transition-all duration-300"
								onClick={handleSubmit}
							>
								Log in
							</button>
						</div>
                        {message && <p className="text-red-500 mt-4">{message}</p>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;