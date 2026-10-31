"use client";

import * as React from "react";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalContext } from "@/components/portal/portal-context";
import { cn } from "@/lib/utils";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const toggleExpand = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleMobileOpen = React.useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = React.useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      toggleMobileSidebar: toggleMobileOpen,
    }),
    [toggleMobileOpen]
  );

  return (
    <PortalContext.Provider value={contextValue}>
      <div className="min-h-screen flex bg-[#F5F6F8] text-[#171717] selection:bg-[#171717] selection:text-white">
        {/* Mobile Drawer Backdrop */}
        {isMobileOpen && (
          <div
            onClick={closeMobile}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Desktop / Mobile Sidebar */}
        <PortalSidebar
          isExpanded={isExpanded}
          onToggleExpand={toggleExpand}
          onNavigateMobile={closeMobile}
          className={cn(
            "transition-all duration-200",
            isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "max-md:-translate-x-full"
          )}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-200",
            isExpanded ? "md:pl-64" : "md:pl-20"
          )}
        >
          {children}
        </div>
      </div>
    </PortalContext.Provider>
  );
}
