"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Building,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PORTAL_PRICING_PLANS, PORTAL_SUBSCRIPTIONS } from "@/features/portal/mock-data";
import { PricingPlan } from "@/features/portal/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PortalPlansPage() {
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = React.useState<PricingPlan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  // Check which plans customer already has
  const subscribedPlanNames = PORTAL_SUBSCRIPTIONS.map(
    (s) => s.items[0]?.planName.toLowerCase()
  );

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubscribe = () => {
    if (!selectedPlan) return;
    setShowConfirmDialog(false);
    setSuccessNotice(
      `Congratulations! You have subscribed to ${selectedPlan.productName} (${selectedPlan.planName}). Your account has been upgraded.`
    );
    setTimeout(() => setSuccessNotice(null), 6000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="Available Plans"
        subtitle="Upgrade your infrastructure, expand subscriptions, or unlock features"
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-10">
        {/* Banner Alert for Recent Subscription */}
        {successNotice && (
          <div className="p-4 rounded-[16px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Pricing Header & Billing Toggle */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs font-semibold">
            Predictable SaaS Pricing
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Flexible plans that scale with your customer base
          </h2>
          <p className="text-xs sm:text-sm text-[#737373]">
            No surprise surcharges. Switch between monthly or annual billing at any time with automatic prorated credits.
          </p>

          {/* Billing Interval Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center bg-[#EAECEF]/80 p-1 rounded-full shadow-inner border border-[#EAECEF]">
              <button
                type="button"
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-white text-[#171717] shadow-xs"
                    : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("yearly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingPeriod === "yearly"
                    ? "bg-[#171717] text-white shadow-xs"
                    : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {PORTAL_PRICING_PLANS.map((plan) => {
            const price =
              billingPeriod === "yearly"
                ? Math.round(plan.yearlyPrice / 12)
                : plan.monthlyPrice;
            const isCurrent = subscribedPlanNames.some((p) =>
              p?.includes(plan.planName.toLowerCase())
            );

            return (
              <div
                key={plan.id}
                className={`rounded-[24px] bg-white border p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between relative ${
                  plan.isPopular
                    ? "border-indigo-600 ring-2 ring-indigo-600/10"
                    : "border-[#EAECEF]"
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {plan.productName}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">
                      {plan.planName}
                    </h3>
                    <p className="text-xs text-[#737373] mt-2 min-h-[36px] line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="my-6 pb-6 border-b border-[#EAECEF]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#171717] tracking-tight">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-xs font-semibold text-[#737373]">
                        /mo
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737373] mt-1.5">
                      {billingPeriod === "yearly"
                        ? `Billed annually (${formatCurrency(plan.yearlyPrice)}/yr)`
                        : "Billed monthly, cancel anytime"}
                    </div>
                    {plan.trialDays > 0 && (
                      <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Includes {plan.trialDays}-day free trial</span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold text-[#171717] uppercase tracking-wider">
                      Included Capabilities
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 text-xs ${
                          feat.included ? "text-[#171717]" : "text-slate-400"
                        }`}
                      >
                        {feat.included ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3" />
                          </div>
                        )}
                        <span className={feat.included ? "font-medium" : "line-through text-slate-400"}>
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="pt-2">
                  {isCurrent ? (
                    <Button
                      disabled
                      className="w-full h-11 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Current Plan
                    </Button>
                  ) : plan.tier === "enterprise" ? (
                    <Link href="/portal/support">
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl text-xs font-bold border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white transition-colors"
                      >
                        Contact Sales
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full h-11 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        plan.isPopular
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-[#171717] hover:bg-black text-white"
                      }`}
                    >
                      Subscribe Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Assurance Banner */}
        <section className="rounded-[20px] bg-white border border-[#EAECEF] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717]">
                Need custom volume licensing or compliance agreements?
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                We support custom Master Services Agreements (MSA), Business Associate Agreements (BAA for HIPAA), and multi-entity consolidated billing.
              </p>
            </div>
          </div>
          <Link href="/portal/support" className="shrink-0">
            <Button
              variant="outline"
              className="rounded-xl border-[#EAECEF] text-xs font-semibold px-4 h-10 hover:bg-slate-50"
            >
              Talk to Enterprise Support &rarr;
            </Button>
          </Link>
        </section>
      </main>

      {/* Subscribe Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md bg-white rounded-[20px] p-6 border-[#EAECEF]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Confirm Subscription to {selectedPlan?.planName}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Review your selected plan terms before finalizing activation.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-xl bg-[#F5F6F8] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Product:</span>
                  <span className="font-bold text-[#171717]">{selectedPlan.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Billing Cycle:</span>
                  <span className="font-semibold text-[#171717] capitalize">{billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Amount:</span>
                  <span className="font-black text-indigo-600 text-sm">
                    {formatCurrency(
                      billingPeriod === "yearly"
                        ? selectedPlan.yearlyPrice
                        : selectedPlan.monthlyPrice
                    )}
                    <span className="text-xs font-normal text-[#737373]">
                      /{billingPeriod === "yearly" ? "year" : "month"}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Trial Period:</span>
                  <span className="text-emerald-700 font-bold">{selectedPlan.trialDays} days free</span>
                </div>
              </div>

              <p className="text-[11px] text-[#737373] leading-relaxed">
                Your default payment method (ACH ••8821) will be billed after the trial period ends. You can cancel or pause anytime from your subscriptions dashboard without penalty.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="rounded-xl text-xs border-[#EAECEF]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubscribe}
              className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold"
            >
              Start Free Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
