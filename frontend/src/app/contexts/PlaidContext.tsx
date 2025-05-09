"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

// Global variable to track script initialization across component remounts
// This prevents the script from being reloaded unnecessarily when the component re-renders.
let isScriptLoaded = false;
const PLAID_SCRIPT_ID = 'plaid-link-script';

// Define the shape of the context to ensure TypeScript type safety
interface PlaidContextType {
  isPlaidInitialized: boolean; // Indicates whether the Plaid script has been loaded and initialized
}

// Create a React Context to manage Plaid initialization state
const PlaidContext = createContext<PlaidContextType>({ isPlaidInitialized: false });

interface PlaidProviderProps {
  children: React.ReactNode; // React children to wrap with the provider
}

/**
 * PlaidProvider component is responsible for managing the lifecycle of the Plaid Link script.
 * It ensures the script is loaded only once and provides context for components that need to check if Plaid is ready.
 */
export const PlaidProvider: React.FC<PlaidProviderProps> = ({ children }) => {
  // State to track whether the Plaid script has been initialized
  const [isPlaidInitialized, setIsPlaidInitialized] = useState(false);

  useEffect(() => {
    // Ensure this effect runs only in the browser environment (not during SSR)
    if (typeof window === 'undefined' || isScriptLoaded) return;

    // Check if the script already exists in the DOM
    let script = document.getElementById(PLAID_SCRIPT_ID) as HTMLScriptElement;

    if (!script) {
      // If script is not present, create a new script element
      script = document.createElement('script');
      script.id = PLAID_SCRIPT_ID;
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'; // Plaid's official Link script
      script.async = true;

      // Once the script is successfully loaded, mark it as initialized
      script.onload = () => {
        isScriptLoaded = true;
        setIsPlaidInitialized(true);
      };

      // Append the script to the document head so it loads in the background
      document.head.appendChild(script);
    } else {
      // If the script exists but was not previously marked as loaded (e.g., after a hot reload)
      isScriptLoaded = true;
      setIsPlaidInitialized(true);
    }

    return () => {
      // Cleanup function: Ensures the script is removed when the provider is unmounted
      // This prevents memory leaks and ensures fresh initialization if needed
      if (typeof window !== 'undefined' && !document.querySelector('[data-plaid-provider]')) {
        const scriptToRemove = document.getElementById(PLAID_SCRIPT_ID);
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
          isScriptLoaded = false;
          setIsPlaidInitialized(false);
        }
      }
    };
  }, []);

  return (
    // Provide the initialized state to children components
    <PlaidContext.Provider value={{ isPlaidInitialized }}>
      {/* A wrapper div with a data attribute to track if a provider exists */}
      <div data-plaid-provider>
        {children}
      </div>
    </PlaidContext.Provider>
  );
};

/**
 * Custom hook to access PlaidContext.
 * Throws an error if used outside of a PlaidProvider, enforcing correct usage.
 */
export const usePlaidContext = () => {
  const context = useContext(PlaidContext);
  if (!context) {
    throw new Error('usePlaidContext must be used within a PlaidProvider');
  }
  return context;
};
