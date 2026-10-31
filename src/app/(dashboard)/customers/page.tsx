import * as React from "react";
import { Users, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        description="Manage corporate accounts, billing contacts, payment methods, and lifecycle stages."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Customers Module Initialized"
        description="The customer architecture, service layer, and schema are ready. Implement full customer listing and profile views in the next development stage."
        actionLabel="Configure Customer Schema"
      />
    </div>
  );
}

