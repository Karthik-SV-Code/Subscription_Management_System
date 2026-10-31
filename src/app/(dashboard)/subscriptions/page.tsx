import * as React from "react";
import { Repeat, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Subscriptions",
};

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        description="Monitor active customer contracts, renewal dates, upgrades, downgrades, and cancellations."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>New Subscription</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Repeat className="h-6 w-6" />}
        title="Subscriptions Module Initialized"
        description="Subscription lifecycle state machines and service connectors configured. Ready for subscription table and drawer details."
        actionLabel="Explore Contract Engine"
      />
    </div>
  );
}

