"use client";
import LoginPage from "./auth/login/page";
import Dashboard from "./dashboard/page";

export default function HomePage() {
  // Synchronously get the token. This code will only run on the client.
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // If no token is found, immediately render the LoginPage
  if (!token) {
    return <LoginPage />;
  }

  // Otherwise, render the Dashboard
  return <Dashboard />;
}
