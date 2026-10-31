import * as React from "react";
import { Plus, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_DISCOUNTS } from "@/features/discounts/mock-data";

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
          <Button className="bg-[#171717] hover:bg-black text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {MOCK_DISCOUNTS.map((discount) => {
          const maxRedeem = discount.maxRedemptions || 100;
          const pct = Math.min(100, Math.round((discount.timesRedeemed / maxRedeem) * 100));

          return (
            <div
              key={discount.id}
              className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-3 py-1 font-mono text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {discount.code}
                    </span>
                    <h3 className="text-base font-bold text-[#171717] mt-3">
                      {discount.name}
                    </h3>
                  </div>
                  <StatusBadge status={discount.isActive ? "active" : "inactive"} />
                </div>

                <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                  {discount.percentOff}% off for {discount.durationInMonths} recurring months ({discount.duration})
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAECEF]">
                <div className="flex justify-between text-xs text-[#737373] mb-2 font-medium">
                  <span>Campaign Redemptions</span>
                  <span className="font-bold text-[#171717]">
                    {discount.timesRedeemed} / {maxRedeem}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#171717] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
