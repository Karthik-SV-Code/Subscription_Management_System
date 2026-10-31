"use client";

import * as React from "react";

export interface PortalContextType {
  toggleMobileSidebar: () => void;
}

export const PortalContext = React.createContext<PortalContextType>({
  toggleMobileSidebar: () => {},
});

export function usePortal() {
  return React.useContext(PortalContext);
}

