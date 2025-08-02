"use client";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileNavbar } from "@/components/MobileNavbar";
import { useAuth } from "@/lib/useAuth";
import { usePathname } from "next/navigation";
import "./globals.css";
export default function RootLayout({ children }) {
  const { currentUser, loading, logout } = useAuth();
  const pathname = usePathname();
  const noSidebarPaths = ["/login", "/signup"];

  const showSidebar = !loading && currentUser && !noSidebarPaths.includes(pathname);
  if (loading) {
    return (
      <html lang="en">
        <body>
          <div className="flex justify-center items-center h-screen">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen pt-12 md:pt-0"> 
          {showSidebar && <MobileNavbar currentUser={currentUser} logout={logout} />}
          {showSidebar && (
            <div className="hidden md:block">
              <LeftSidebar currentUser={currentUser} logout={logout} />
            </div>
          )}

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
