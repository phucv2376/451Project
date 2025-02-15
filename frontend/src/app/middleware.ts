import { getCookie, setCookie, deleteCookie } from "cookies-next";
import API_BASE_URL from "./config";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
  const accessToken = getCookie("accessToken", { req });
  const refreshToken = getCookie("refreshToken", { req });

  if (!accessToken && refreshToken) {
    // Try to refresh token if access token is missing
    const response = await fetch(`${API_BASE_URL}}/Auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("accessToken", data.token);
    } else {
      deleteCookie("refreshToken", { req });
    }
  }
  return NextResponse.next();
}

// Apply middleware to ALL routes
export const config = { matcher: "/:path*" };
