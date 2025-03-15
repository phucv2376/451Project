"use client"; // Ensures this component runs on the client-side in Next.js

import React, { Suspense } from "react";
import SignalRClient from "./SignalRClient"; // Component to handle real-time SignalR connections
import { PlaidProvider } from '../contexts/PlaidContext'; // Provides Plaid Link script initialization and context

/**
 * ClientLayout Component
 * 
 * This component serves as a high-level layout wrapper for client-side components.
 * It ensures:
 * - The Plaid integration is available throughout the application by using `PlaidProvider`
 * - The SignalR client is initialized for real-time communication
 * - A suspense boundary is set up to handle asynchronous component loading
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will be wrapped by this layout
 */
export default function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Wrap the application with PlaidProvider to ensure Plaid scripts and context are available
    <PlaidProvider>
      {/* Suspense boundary to handle lazy-loaded components, displaying a fallback UI while loading */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* Initializes SignalRClient for handling real-time updates */}
        <SignalRClient />
        
        {/* Main content of the application */}
        <main>
          {children}
        </main>
      </Suspense>
    </PlaidProvider>
  );
}
