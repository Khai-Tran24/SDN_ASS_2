"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ShoppingBag, Users, Sprout, Home,LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/authContext";

export default function DashboardSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="font-semibold">Perfume Dashboard</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton>
                <Home className="mr-2" />
                <span>Home</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/dashboard/perfumes" passHref>
              <SidebarMenuButton isActive={pathname === "/dashboard/perfumes"}>
                <Sprout className="mr-2" />
                <span>Perfumes</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/dashboard/brands" passHref>
              <SidebarMenuButton isActive={pathname === "/dashboard/brands"}>
                <ShoppingBag className="mr-2" />
                <span>Brands</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/dashboard/members" passHref>
              <SidebarMenuButton isActive={pathname === "/dashboard/members"}>
                <Users className="mr-2" />
                <span>Members</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline" onClick={logout}>
              <LogOut className="mr-2" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
