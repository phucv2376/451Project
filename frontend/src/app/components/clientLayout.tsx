"use client"; // Ensures this component runs on the client-side in Next.js

import React, { Suspense, useMemo } from "react";
import SignalRClient from "./SignalRClient"; // Handles real-time SignalR connections
import { PlaidProvider } from '../contexts/PlaidContext'; // Provides Plaid integration context
import NotificationBell from "../components/NotificationBell"; // Global NotificationBell

/**
 * ClientLayout Component
 * 
 * - Wraps the entire application with `PlaidProvider` for Plaid banking integration
 * - Initializes `SignalRClient` for real-time updates
 * - Uses a `Suspense` boundary for better performance and UI loading experience
 * - Keeps `NotificationBell` global to avoid unnecessary re-renders
 */
const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  // Memoize providers to prevent unnecessary re-renders
  const wrappedChildren = useMemo(() => (
    <Suspense fallback={<LoadingFallback />}>
      <SignalRClient />
      <main>{children}</main>
    </Suspense>
  ), [children]);

  return (
    <PlaidProvider>
      {/* ✅ Global NotificationBell (Persists across pages) */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>

      {wrappedChildren}
    </PlaidProvider>
  );
};

/**
 * LoadingFallback Component
 * - Displays a simple loading animation while components are being loaded.
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen text-gray-600">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    <p className="ml-3 text-lg">Loading...</p>
  </div>
);

export default ClientLayout;
