"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, LogOut, User, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MyHeader() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme : undefined;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex items-center justify-between p-4 border dark:border-b-gray-700">
      <Link href="/">
        {mounted && (
          <Image
            src={currentTheme === "dark" ? "/vercel.svg" : "/vercel-dark.svg"}
            alt="brand logo"
            width={28}
            height={28}
            priority
          />
        )}
      </Link>

      <div className="flex items-center space-x-4">
        <Button
          variant={"outline"}
          className="cursor-pointer p-4"
          size={"icon"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {isAuthenticated && user && token ? (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user._id}`}>Profile</Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/perfumes">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button className="cursor-pointer p-4">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant={"outline"} className="cursor-pointer p-4">
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
