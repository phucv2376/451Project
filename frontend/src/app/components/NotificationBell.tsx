"use client"; // This directive ensures the component is rendered on the client side in Next.js

// Import necessary React hooks for managing component state and side effects.
import { useEffect, useState } from "react";

// Define the Notification interface to ensure each notification object has a 'message' and a 'timestamp'
interface Notification {
  message: any; // The notification message
  timestamp: Date; // The time when the notification was received
}

// Export the NotificationBell component as default.
export default function NotificationBell() {
  // State to store all notifications. Initially an empty array.
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // State to control the visibility of the notification dropdown/modal.
  const [showNotifications, setShowNotifications] = useState(false);

  // useEffect hook to add an event listener for custom "notification" events
  useEffect(() => {
    // Handler function to process a notification event.
    // It casts the generic Event to a CustomEvent so we can access the 'detail' property,
    // then adds a new notification (with the current timestamp) to the state array.
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { message: customEvent.detail, timestamp: new Date() },
      ]);
    };

    // Attach the event listener to the window for "notification" events.
    window.addEventListener("notification", handleNotification);
    // Cleanup function: remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener("notification", handleNotification);
    };
  }, []); // Empty dependency array ensures this runs once after initial render.

  // Function to toggle the visibility of the notifications list.
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  // Function to remove a specific notification from the state when clicked ("mark as read").
  // It filters out the notification by its index.
  const removeNotification = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  // Render the component
  return (
    // The outer div is set to relative and inline-block so that any absolutely positioned
    <div className="relative inline-block">
      
      {/* Conditionally render the notification list if showNotifications is true and there are notifications */}
      {showNotifications && notifications.length > 0 && (
        <>
          {/** 
            * Mobile Version:
            * "block md:hidden" makes this visible on mobile (small screens) and hidden on medium and larger screens.
            * "absolute top-full right-0 mt-2" positions it directly below the bell, aligned to the right edge.
            * "w-64 bg-white border rounded shadow-lg z-50" applies styling for width, background, border, rounded corners, shadow, and stacking order.
            */}
          <div className="block md:hidden absolute top-full right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
            <ul className="max-h-60 overflow-y-auto">
              {notifications.map((n, index) => (
                // Each notification is rendered as a list item with hover effects.
                <li
                  key={index}
                  className="p-2 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => removeNotification(index)} // Clicking removes the notification.
                >
                  {/* Display the notification message */}
                  <div className="text-sm text-gray-800">{n.message}</div>
                  {/* Display the time the notification was received, formatted to locale time */}
                  <div className="text-xs text-gray-500">
                    {n.timestamp.toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/** 
            * Desktop Version:
            * "hidden md:block" makes this hidden on mobile and visible on medium and larger screens.
            * "absolute left-full bottom-full ml-2" positions it to the right and above the bell.
            * "w-64 bg-white border rounded shadow-lg z-50" applies similar styling as the mobile version.
            */}
          <div className="hidden md:block absolute left-full bottom-full ml-2 w-64 bg-white border rounded shadow-lg z-50">
            <ul className="max-h-60 overflow-y-auto">
              {notifications.map((n, index) => (
                <li
                  key={index}
                  className="p-2 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => removeNotification(index)}
                >
                  <div className="text-sm text-gray-800">{n.message}</div>
                  <div className="text-xs text-gray-500">
                    {n.timestamp.toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* The Bell Icon itself */}
      {/* The onClick handler toggles the display of the notifications list */}
      <div onClick={toggleNotifications} className="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700" // Icon size and color
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {/* The bell icon's path data */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/** 
          * Notification Count Badge:
          * This badge is absolutely positioned at the top-right of the bell icon,
          * showing the number of notifications currently stored.
          */}
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>
    </div>
  );
}
