import * as React from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions"
        description="Audit gateway transaction logs, ACH and card clearing, dunning retries, and refunds."
        actions={
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Sync Gateways</span>
          </Button>
        }
      />

      <EmptyState
        icon={<CreditCard className="h-6 w-6" />}
        title="Payments Module Initialized"
        description="Payment transaction interfaces, status mappers, and webhook payloads configured."
        actionLabel="Configure Gateway Webhooks"
      />
    </div>
  );
}

