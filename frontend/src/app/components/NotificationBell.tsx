"use client";

import { useEffect, useState, useCallback } from "react";

// ----------------------------------------------------------------------
// Notification Interface
// ----------------------------------------------------------------------
// This interface defines the structure of a notification object.
// Each notification contains a message (string) and a timestamp (Date).
// ----------------------------------------------------------------------
interface Notification {
  message: string; // The notification message content
  timestamp: Date; // Timestamp when the notification was received
}

export default function NotificationBell() {
  // State for storing notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // State for controlling the visibility of the dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // ----------------------------------------------------------------------
  // Function: handleNotification
  // ----------------------------------------------------------------------
  // This function is triggered when a "notification" event is received.
  // It updates the notification list with the new message.
  // ----------------------------------------------------------------------
  const handleNotification = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<string>; // Ensure it's a custom event with a string message

    setNotifications((prevNotifications) => [
      { message: customEvent.detail, timestamp: new Date() }, // Add the new notification at the top
      ...prevNotifications, // Keep previous notifications
    ]);
  }, []);

  // ----------------------------------------------------------------------
  // Effect Hook: useEffect
  // ----------------------------------------------------------------------
  // - Listens for custom "notification" events dispatched from SignalRClient.
  // - Cleans up the event listener when the component unmounts.
  // ----------------------------------------------------------------------
  useEffect(() => {
    window.addEventListener("notification", handleNotification);
    return () => window.removeEventListener("notification", handleNotification);
  }, [handleNotification]);

  // ----------------------------------------------------------------------
  // Function: toggleNotifications
  // ----------------------------------------------------------------------
  // Toggles the visibility of the notification dropdown.
  // ----------------------------------------------------------------------
  const toggleNotifications = () => setShowNotifications((prev) => !prev);

  // ----------------------------------------------------------------------
  // Function: removeNotification
  // ----------------------------------------------------------------------
  // Removes a specific notification from the list based on its index.
  // ----------------------------------------------------------------------
  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative inline-block">
      {/* ---------------------------------------------------------------- */}
      {/* Notification Bell Icon */}
      {/* - Clicking this toggles the notifications dropdown */}
      {/* - If there are new notifications, a red badge appears */}
      {/* ---------------------------------------------------------------- */}
      <button
        onClick={toggleNotifications}
        className="relative flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700 hover:text-gray-900"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification Badge (Only shows if there are unread notifications) */}
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2">
            {notifications.length}
          </span>
        )}
      </button>

      {/* ---------------------------------------------------------------- */}
      {/* Notification Dropdown */}
      {/* - Displays the list of notifications */}
      {/* - Appears when showNotifications is true */}
      {/* ---------------------------------------------------------------- */}
      {showNotifications && (
        <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Dropdown Header */}
          <div className="p-4 border-b text-gray-900 font-semibold bg-gray-50">
            Notifications
          </div>

          {/* Notification List */}
          <ul className="max-h-64 overflow-y-auto">
            {/* If no notifications exist, show a placeholder */}
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-500 text-center">No notifications</li>
            ) : (
              notifications.map((n, index) => (
                <li
                  key={index}
                  className="p-4 border-b cursor-pointer hover:bg-gray-100 flex justify-between items-center transition"
                  onClick={() => removeNotification(index)}
                >
                  <div className="flex-1">
                    {/* Notification Message */}
                    <div className="text-sm font-medium text-gray-800">{n.message}</div>
                    {/* Timestamp */}
                    <div className="text-xs text-gray-500">
                      {n.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Remove Notification Button */}
                  <button
                    className="text-red-500 text-xs hover:text-red-700 transition"
                    onClick={() => removeNotification(index)}
                  >
                    ✕
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
