import * as React from "react";
import { Package, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Products Catalog",
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        description="Configure subscription products, plan associations, feature packages, and service tiers."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>New Product</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="Products Module Initialized"
        description="Product definitions and pricing models are defined in the schema. Ready for product catalog UI implementation."
        actionLabel="Create First Product"
      />
    </div>
  );
}

