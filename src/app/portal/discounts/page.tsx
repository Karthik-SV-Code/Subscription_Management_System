"use client";

import * as React from "react";
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  Clock,
  Percent,
  CheckCircle2,
  AlertCircle,
  Gift,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PORTAL_DISCOUNTS } from "@/features/portal/mock-data";
import { Discount } from "@/features/discounts/types";
import { formatDate, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PortalDiscountsPage() {
  const [discounts, setDiscounts] = React.useState<Discount[]>(PORTAL_DISCOUNTS);
  const [couponInput, setCouponInput] = React.useState("");
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [applyFeedback, setApplyFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCopy = async (code: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const code = couponInput.trim().toUpperCase();
    const found = discounts.find(
      (d) => d.code.toUpperCase() === code && d.isActive
    );

    if (found) {
      setApplyFeedback({
        type: "success",
        message: `Promo code "${found.code}" successfully applied! ${found.percentOff}% off will reflect on your next renewal.`,
      });
      setCouponInput("");
    } else {
      setApplyFeedback({
        type: "error",
        message: `Promo code "${code}" is invalid or has expired. Please verify and try again.`,
      });
    }

    setTimeout(() => setApplyFeedback(null), 6000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="Discounts & Coupons"
        subtitle="Active promotional vouchers, incubator partner perks, and loyalty grants"
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-8">
        {/* Top Banner / Coupon Input Card */}
        <section className="rounded-[24px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                Have an enterprise promotional coupon code?
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Enter your code below to attach the discount credit directly to your upcoming billing run.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleApplyCoupon}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Input
              type="text"
              placeholder="e.g. LAUNCH20"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full md:w-56 h-10 rounded-xl bg-[#F5F6F8] border-[#EAECEF] text-xs font-mono font-bold uppercase tracking-wider text-[#171717] focus:bg-white"
            />
            <Button
              type="submit"
              className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold h-10 px-5 shrink-0"
            >
              Apply Code
            </Button>
          </form>
        </section>

        {/* Feedback Alert */}
        {applyFeedback && (
          <div
            className={`p-4 rounded-[16px] text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 ${
              applyFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {applyFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{applyFeedback.message}</span>
            </div>
            <button
              onClick={() => setApplyFeedback(null)}
              className="hover:opacity-75 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Available Discounts Grid */}
        <div>
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#171717]">
              Available Corporate Discounts & Offers
            </h3>
            <p className="text-xs text-[#737373]">
              Active discounts eligible for account redemptions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discounts.map((disc) => {
              const isCopied = copiedCode === disc.code;

              return (
                <div
                  key={disc.id}
                  className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Name & Active badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-base font-extrabold text-[#171717]">
                          {disc.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-indigo-600 capitalize">
                          {disc.duration === "repeating"
                            ? `${disc.durationInMonths} Months Recurring`
                            : disc.duration === "forever"
                            ? "Permanent Lifetime Benefit"
                            : "Single Cycle Discount"}
                        </span>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        ACTIVE
                      </Badge>
                    </div>

                    {/* Discount Value */}
                    <div className="my-4 p-4 rounded-xl bg-[#F5F6F8] flex items-center justify-between border border-[#EAECEF]/80">
                      <div>
                        <div className="text-2xl font-black text-[#171717] tracking-tight">
                          {disc.percentOff}% OFF
                        </div>
                        <div className="text-[11px] text-[#737373] mt-0.5">
                          Applies to subscription line items
                        </div>
                      </div>

                      {/* Monospace Code Pill */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm tracking-wider bg-white border border-[#EAECEF] px-3 py-1.5 rounded-lg text-[#171717] shadow-xs">
                          {disc.code}
                        </span>
                      </div>
                    </div>

                    {/* Redemption counter info */}
                    <div className="text-xs text-[#737373] space-y-1.5 mb-6">
                      {disc.maxRedemptions && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Community Usage:</span>
                          <span className="font-medium text-[#171717]">
                            {disc.timesRedeemed} of {disc.maxRedemptions} redeemed
                          </span>
                        </div>
                      )}
                      {disc.expiresAt && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Valid Until:</span>
                          <span className="font-medium text-[#171717]">
                            {formatDate(disc.expiresAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="pt-3 border-t border-[#EAECEF] flex items-center justify-between">
                    <span className="text-[11px] text-[#737373]">
                      Click to copy code to clipboard
                    </span>
                    <Button
                      onClick={() => handleCopy(disc.code)}
                      variant={isCopied ? "default" : "outline"}
                      size="sm"
                      className={`h-8 rounded-xl text-xs font-semibold transition-all ${
                        isCopied
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-[#EAECEF] text-[#171717] hover:bg-slate-50"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
