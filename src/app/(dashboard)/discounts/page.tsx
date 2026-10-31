import * as React from "react";
import { Tag, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Discounts & Coupons",
};

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts & Coupons"
        description="Set up promotional discount codes, partner coupon campaigns, and customer loyalty rebates."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Tag className="h-6 w-6" />}
        title="Discounts Module Initialized"
        description="Promotional code data models, duration rules, and redemption limits set up."
        actionLabel="Create Promo Campaign"
      />
    </div>
  );
}

