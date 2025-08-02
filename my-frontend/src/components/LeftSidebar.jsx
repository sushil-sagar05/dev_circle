"use client";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostDialog } from "@/components/PostDialog";
import { User,HomeIcon,Settings} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export function LeftSidebar({ currentUser, logout }) {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const avatarText = currentUser?.fullname?.[0]?.toUpperCase() || "?";
  return (
    <div className="w-64 border-r min-h-screen flex flex-col p-4">
      <div className="mb-6 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={currentUser?.avatar} alt="Profile" />
          <AvatarFallback>{avatarText}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{currentUser?.fullname || "Guest"}</p>
          <p className="text-sm text-gray-500">{currentUser?.email || "guest"}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        <SidebarNavLink icon={<HomeIcon/>} href="/" text="Home" />
        <SidebarNavLink
          icon={<User/>}
          href={`/user/${currentUser?._id || "#"}`}
          text="Profile"
        />
        <SidebarNavLink icon={<Settings/>} href="/settings" text="Settings" />
        <div className="flex items-center gap-2 text-lg hover:bg-gray-100 p-2 pl-0 rounded-lg transition-colors">
          <div className="w-8 flex justify-center">
            <span className="text-xl"></span>
          </div>
          <PostDialog />
        </div>
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full bg-red-500" onClick={() => setIsLogoutOpen(true)}>
          Log out
        </Button>
      </div>
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                setIsLogoutOpen(false);
              }}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function SidebarNavLink({ icon, href, text }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-lg hover:bg-gray-100 p-2 rounded-lg transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}
