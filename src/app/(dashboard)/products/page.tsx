import * as React from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_PRODUCTS } from "@/features/products/mock-data";

export const metadata = {
  title: "Product Catalog",
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog & Features"
        description="Configure subscription software products, feature entitlements, and pricing packages."
        actions={
          <Button className="bg-[#171717] hover:bg-black text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>New Product</span>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Product Code: {product.code}
                  </span>
                  <h3 className="text-lg font-bold text-[#171717] mt-2">
                    {product.name}
                  </h3>
                </div>
                <StatusBadge status={product.status} />
              </div>

              <p className="text-xs text-[#737373] mt-3 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-5 pt-4 border-t border-[#EAECEF] space-y-2.5 text-xs">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[#171717] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAECEF] flex items-center justify-between text-xs">
              <span className="text-[#737373] font-medium">
                {product.plansCount} Billing Plans
              </span>
              <span className="font-bold text-indigo-600">
                {product.activeSubscriptionsCount} Subscriptions Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
