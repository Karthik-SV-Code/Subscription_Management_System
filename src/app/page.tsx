import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import DashboardPage from "@/app/(dashboard)/dashboard/page";

export default function RootPage() {
  return (
    <DashboardShell>
      <DashboardPage />
    </DashboardShell>
  );
}
