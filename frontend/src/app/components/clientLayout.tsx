// The ClientLayout component is a layout component that wraps the main content of the application. 
// The Suspense component is used to provide a loading fallback while components are loading.
"use client";
import { Suspense } from "react";
import SignalRClient from "./SignalRClient";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    // Suspense component ensures a fallback UI while components are loading.
    <Suspense fallback={<div>Loading...</div>}>
       <SignalRClient />
      {/* Conditionally render the Navbar if the route is not in the noNavbarRoutes list. */}
      <main>
        {children} {/* Render the main content of the page. */}
      </main>
    </Suspense>
  );
}
