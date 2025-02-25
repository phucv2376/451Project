// The ClientLayout component is a layout component that wraps the main content of the application. 
// It includes a Navbar component that is displayed on all routes except those specified in the noNavbarRoutes array. 
// The Suspense component is used to provide a loading fallback while components are loading.
"use client";
import { Suspense } from "react";
import { usePathname } from 'next/navigation';

// List of routes where the Navbar should not be displayed.
const noNavbarRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgotPassword",
];

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the current pathname from Next.js navigation.
  const pathname = usePathname();

  // Determine whether the Navbar should be displayed based on the current route.
  const showNavbar = !noNavbarRoutes.includes(pathname);

  return (
    // Suspense component ensures a fallback UI while components are loading.
    <Suspense fallback={<div>Loading...</div>}>
      {/* Conditionally render the Navbar if the route is not in the noNavbarRoutes list. */}
      <main>
        {children} {/* Render the main content of the page. */}
      </main>
    </Suspense>
  );
}
