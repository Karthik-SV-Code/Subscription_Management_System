import * as React from "react";
import { Receipt, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Review billing runs, automatic tax calculations, line item breakdowns, and PDF downloads."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <FileText className="h-4 w-4" />
            <span>Generate Invoice</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="Invoices Module Initialized"
        description="Invoice schema, billing period calculations, and tax line data structures established."
        actionLabel="View Invoicing Rules"
      />
    </div>
  );
}

