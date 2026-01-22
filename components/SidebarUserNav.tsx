"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchUserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export function SidebarUserNav() {
  const { isAuthenticated, logout, token } = useAuth();

  if (!isAuthenticated && !token) {
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

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => fetchUserProfile(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-full mt-4 rounded-lg" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-3 mt-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer w-full">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500" />
          <div className="text-sm font-medium">
            {user == null ? "" : user.username}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-black/90 border-white/10 text-white"
        align="start"
        side="right"
        sideOffset={10}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user == null ? "" : user.username}
            </p>
            <p className="text-xs leading-none text-white/50">
              {user == null ? "" : user.email}
            </p>
          </div>
        </DropdownMenuLabel>
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
