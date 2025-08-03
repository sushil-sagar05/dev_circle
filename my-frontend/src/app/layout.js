"use client";
import { usePathname } from "next/navigation";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/useAuth";
import { useEffect, useState } from "react";
import "./globals.css";
function LayoutContent({ children }) {
  const { currentUser, loading, logout } = useAuth();
  const pathname = usePathname();
  const noSidebarPaths = ["/login", "/signup"];
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && !noSidebarPaths.includes(pathname)) {
      setShowSidebar(true);
    } else {
      setShowSidebar(false);
    }
  }, [loading, currentUser, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-12 md:pt-0">
      {showSidebar && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50">
          <MobileNavbar currentUser={currentUser} logout={logout} />
        </div>
      )}
      {showSidebar && (
        <div className="hidden md:block">
          <LeftSidebar currentUser={currentUser} logout={logout} />
        </div>
      )}
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Toaster />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
