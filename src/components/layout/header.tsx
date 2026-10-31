"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, Calendar, Menu, Sparkles, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAIN_NAV_ITEMS } from "@/lib/constants";

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();

  const currentNav = MAIN_NAV_ITEMS.find(
    (item) =>
      item.href === pathname ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  ) || {
    title: "Dashboard",
    description: "Revenue telemetry and executive summary",
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#EAECEF] bg-white/90 px-4 sm:px-8 backdrop-blur">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden text-[#737373] hover:text-[#171717] rounded-xl"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">
            {currentNav.title}
          </h1>
          {currentNav.description && (
            <p className="text-xs text-[#737373] hidden sm:block">
              {currentNav.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Prominent Search bar */}
        <div className="w-48 sm:w-72">
          <SearchInput
            placeholder="Search records..."
            className="w-full bg-[#F5F6F8] border-[#EAECEF] rounded-xl text-xs"
          />
        </div>

        {/* Current Date Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F6F8] border border-[#EAECEF] text-xs font-medium text-[#737373]">
          <Calendar className="h-3.5 w-3.5" />
          <span>Oct 31, 2026</span>
        </div>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#737373] hover:text-[#171717] rounded-xl"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </Button>

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ring-1 ring-[#EAECEF] hover:ring-slate-300"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[#171717] text-white font-semibold text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl border-[#EAECEF] p-1.5" align="end" forceMount>
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-[#171717]">
                  Enterprise Workspace
                </p>
                <p className="text-xs text-[#737373]">admin@subscriptiq.io</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#EAECEF]" />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-xs py-2">
              <User className="mr-2 h-4 w-4 text-[#737373]" />
              <span>Account Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg text-xs py-2">
              <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Billing Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#EAECEF]" />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-xs py-2 text-rose-600 focus:text-rose-600">
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
