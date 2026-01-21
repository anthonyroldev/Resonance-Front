"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { LogIn, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

export function SidebarUserNav() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-3 p-3 mt-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-white/70 hover:text-white"
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <LogIn className="w-4 h-4" />
        </div>
        <div className="text-sm font-medium">Log in / Register</div>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 p-3 mt-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer w-full">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500" />
            <div className="text-sm font-medium">Guest User</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 border-white/10 text-white" align="start" side="right" sideOffset={10}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Guest User</p>
            <p className="text-xs leading-none text-white/50">
              guest@resonance.app
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
            className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
            onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
