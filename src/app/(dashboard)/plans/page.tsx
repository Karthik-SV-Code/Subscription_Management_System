import * as React from "react";
import { Layers, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing Plans",
};

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Plans & Tiers"
        description="Establish billing intervals, trial configurations, seat-based metrics, and tiered rates."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Layers className="h-6 w-6" />}
        title="Plans Module Initialized"
        description="Plan service interfaces and mock structures are active. Ready for plan builder implementation."
        actionLabel="Configure Pricing Matrix"
      />
    </div>
  );
}

