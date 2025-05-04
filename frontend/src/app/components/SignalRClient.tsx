"use client"; // Ensures this component is rendered on the client side in Next.js

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

// ----------------------------------------------------------------------
// Custom Hook: useLocalStorageToken
// ----------------------------------------------------------------------
// This hook retrieves a token from localStorage and sets up polling
// to update the token state every 500ms. This ensures that if the token
// in localStorage changes (for example, after a user logs in or refreshes),
// the component using this hook will get the updated value.
// ----------------------------------------------------------------------
function useLocalStorageToken(key: string): string | null {
  // Initialize state with the current token from localStorage.
  // The check ensures that window is defined (i.e., we're in a browser environment).
  const [value, setValue] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null; // Return null if window is undefined (server-side rendering)
    }
    return localStorage.getItem(key); // Retrieve the token from localStorage
  });

  useEffect(() => {
    // Set up an interval to poll localStorage every 500ms.
    const intervalId = setInterval(() => {
      if (typeof window !== "undefined") {
        // Retrieve the latest token from localStorage and update state.
        setValue(localStorage.getItem(key));
      }
    }, 500);
    // Clean up the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [key]); // Only re-run if the key changes.

  return value; // Return the current token (or null if not present)
}

// ----------------------------------------------------------------------
// Component: SignalRClient
// ----------------------------------------------------------------------
// This component establishes a SignalR connection to the specified URL.
// It uses the accessToken from localStorage (via the custom hook above)
// for authentication. When a "ReceiveNotification" event is received,
// it dispatches a custom "notification" event on the window object so that
// other parts of the app (like a NotificationBell) can respond.
// ----------------------------------------------------------------------
export default function SignalRClient() {
  // Retrieve the access token from localStorage using the custom hook.
  const accessToken = useLocalStorageToken("accessToken");

  useEffect(() => {
    // If there is no access token, log a warning and do not attempt to connect.
    if (!accessToken) {
      return;
    }

    // Build a SignalR connection using the provided URL and accessToken for authentication.
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7105/notifications", {
        // accessTokenFactory returns the token that SignalR uses to authenticate.
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect() // Enable automatic reconnection if the connection is lost.
      .configureLogging(signalR.LogLevel.Information) // Log connection info for debugging.
      .build();

    // Start the SignalR connection.
    connection
      .start()
      .then(() => console.log("Connected to SignalR"))
      .catch((err) => console.error("SignalR connection error:", err));

    // Set up an event handler for "ReceiveNotification" events from the server.
    connection.on("ReceiveNotification", (message) => {
      console.log("Received notification:", message);
      window.dispatchEvent(new CustomEvent("notification", { detail: message }));
    });

    // Add handler for new transactions
    connection.on("ReceiveNewTransaction", (transactionDate, category, amount, name) => {
      window.dispatchEvent(new CustomEvent("newTransaction", { 
        detail: { transactionDate, category, amount, name } 
      }));
    });

    // Cleanup: When the component unmounts or accessToken changes,
    // remove the event handler and stop the connection.
    return () => {
      connection.off("ReceiveNotification");
      connection.off("ReceiveNewTransaction");
      connection.stop();
    };
  }, [accessToken]); // This effect runs whenever the accessToken changes.

  // This component doesn't render any UI, it simply manages the connection.
  return null;
}
