"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-40">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Header onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
