"use client";
import { useState, useEffect } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
export function MobileNavbar({ currentUser, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="flex items-center justify-between px-4 py-3">
       <Link href="/">
        <div className="text-xl font-bold text-gray-800 cursor-pointer">Dev Circle</div>
        </Link>
        <Button
          variant="ghost"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
      </div>
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-4 py-4">
            <LeftSidebar currentUser={currentUser} logout={logout} isMobile />
          </div>
        </div>
      )}
    </nav>
  );
}
