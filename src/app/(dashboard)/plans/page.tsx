import * as React from "react";
import { Plus, Check } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MOCK_PLANS } from "@/features/plans/mock-data";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Pricing Plans",
};

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Plans & Cadence"
        description="Establish billing intervals, trial configurations, seat-based metrics, and tiered rates."
        actions={
          <Button className="bg-[#171717] hover:bg-black text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {MOCK_PLANS.map((plan) => {
          const isPopular = plan.code === "PLAN-GROWTH-M";

          return (
            <div
              key={plan.id}
              className={`bg-white p-6 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between relative transition-all ${
                isPopular
                  ? "border-2 border-[#171717] shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                  : "border border-[#EAECEF]"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-[#171717] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  {plan.pricingModel.replace("_", " ")}
                </span>
                <h3 className="text-lg font-bold text-[#171717] mt-1">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#171717]">
                    {formatCurrency(plan.amount)}
                  </span>
                  <span className="text-xs text-[#737373]">/ {plan.interval}</span>
                </div>
                <p className="text-xs text-[#737373] mt-2.5 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-6 space-y-2.5 border-t border-[#EAECEF] pt-4 text-xs text-[#171717]">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{plan.trialPeriodDays}-day free trial period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Automated billing & renewal runs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Webhooks & notification triggers</span>
                  </div>
                </div>
              </div>

              <button
                className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isPopular
                    ? "bg-[#171717] hover:bg-black text-white"
                    : "border border-[#EAECEF] hover:bg-slate-50 text-[#171717]"
                }`}
              >
                Configure Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
