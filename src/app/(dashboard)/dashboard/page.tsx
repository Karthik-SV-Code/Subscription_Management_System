"use client";

import * as React from "react";
import {
  DollarSign,
  Users,
  Repeat,
  AlertCircle,
  Plus,
  Receipt,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  CreditCard,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SubscriptionChart } from "@/components/charts/subscription-chart";
import { RecentSubscriptionsTable } from "@/features/subscriptions/components/recent-subscriptions-table";
import { RecentInvoicesTable } from "@/features/invoices/components/recent-invoices-table";
import { MOCK_SUBSCRIPTIONS } from "@/features/subscriptions/mock-data";
import { MOCK_INVOICES } from "@/features/invoices/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { downloadCSV, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = React.useState(MOCK_SUBSCRIPTIONS);
  const [invoices, setInvoices] = React.useState(MOCK_INVOICES);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // New Subscription Dialog State
  const [newSubModalOpen, setNewSubModalOpen] = React.useState(false);
  const [newSubCustomer, setNewSubCustomer] = React.useState("");
  const [newSubPlan, setNewSubPlan] = React.useState("Enterprise Dedicated");
  const [newSubCycle, setNewSubCycle] = React.useState<"Monthly" | "Annual">("Monthly");
  const [newSubAmount, setNewSubAmount] = React.useState("499");

  // New Invoice Dialog State
  const [newInvModalOpen, setNewInvModalOpen] = React.useState(false);
  const [newInvCustomer, setNewInvCustomer] = React.useState("");
  const [newInvAmount, setNewInvAmount] = React.useState("1200");
  const [newInvDescription, setNewInvDescription] = React.useState("Platform Contract");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCustomer.trim()) {
      showToast("Please enter a customer name");
      return;
    }

    const newSub = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: `cust_${Math.floor(100 + Math.random() * 900)}`,
      customerName: newSubCustomer,
      customerEmail: `billing@${newSubCustomer.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      status: "active" as const,
      billingCycle: newSubCycle,
      productName: "SubscriptIQ Cloud",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      mrr: Number(newSubAmount) || 499,
      currency: "USD",
      items: [
        {
          id: `si_${Date.now()}`,
          subscriptionId: `SUB-${Date.now()}`,
          planId: "plan_custom",
          planName: newSubPlan,
          productName: "SubscriptIQ Cloud",
          unitAmount: Number(newSubAmount) || 499,
          quantity: 1,
          billingCycle: newSubCycle,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setNewSubModalOpen(false);
    setNewSubCustomer("");
    showToast(`Subscription ${newSub.id} for ${newSub.customerName} created!`);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvCustomer.trim()) {
      showToast("Please enter a customer name");
      return;
    }

    const amt = Number(newInvAmount) || 1200;
    const newInv = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2026-0${Math.floor(250 + Math.random() * 700)}`,
      customerId: `cust_${Math.floor(100 + Math.random() * 900)}`,
      customerName: newInvCustomer,
      customerEmail: `billing@${newInvCustomer.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      status: "pending" as const,
      subtotal: amt,
      tax: 0,
      discountTotal: 0,
      total: amt,
      amountPaid: 0,
      amountDue: amt,
      currency: "USD",
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      lineItems: [
        {
          id: `li_${Date.now()}`,
          description: newInvDescription || "Platform Contract",
          amount: amt,
          quantity: 1,
          unitAmount: amt,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInv, ...prev]);
    setNewInvModalOpen(false);
    setNewInvCustomer("");
    showToast(`Invoice ${newInv.invoiceNumber} created successfully!`);
  };

  const handleQuickExport = () => {
    const exportData = [
      ...subscriptions.map((s) => ({
        Type: "Subscription",
        ID: s.id,
        Customer: s.customerName,
        Plan: s.items[0]?.planName || "Enterprise",
        Amount: `$${s.mrr}/mo`,
        Status: s.status,
      })),
      ...invoices.map((i) => ({
        Type: "Invoice",
        ID: i.invoiceNumber,
        Customer: i.customerName,
        Plan: i.lineItems[0]?.description || "Contract",
        Amount: `$${i.total}`,
        Status: i.status,
      })),
    ];
    downloadCSV(`subscriptiq-dashboard-${formatDate(new Date(), "yyyy-MM-dd")}`, exportData);
    showToast("Dashboard summary exported to CSV");
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* ================= 1. PAGE HEADER & QUICK ACTIONS ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Subscription Management Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
              <Sparkles className="h-3 w-3" />
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time subscriber lifecycle management, recurring revenue velocity, and invoicing settlements.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <Button
            onClick={handleQuickExport}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium shadow-2xs gap-1.5"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Report</span>
          </Button>

          <Button
            onClick={() => setNewInvModalOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium shadow-2xs gap-1.5"
          >
            <Receipt className="h-4 w-4 text-indigo-600" />
            <span>New Invoice</span>
          </Button>

          <Button
            onClick={() => setNewSubModalOpen(true)}
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-500/25 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Subscription</span>
          </Button>
        </div>
      </div>

      {/* ================= 4. DASHBOARD SUMMARY CARDS ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Recurring Revenue */}
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value="$68,450"
          change={14.2}
          trend="up"
          changePeriod="vs last month"
          accentColor="indigo"
          description="ARR run-rate $821.4K · Net expansion +$4.8K"
          icon={<DollarSign className="h-5 w-5" />}
        />

        {/* Card 2: Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value="1,284"
          change={8.5}
          trend="up"
          changePeriod="vs last month"
          accentColor="sky"
          description="98.2% retention rate · 36 new this month"
          icon={<Repeat className="h-5 w-5" />}
        />

        {/* Card 3: Total Customers */}
        <StatCard
          title="Total Customers"
          value="942"
          change={12.1}
          trend="up"
          changePeriod="vs last month"
          accentColor="emerald"
          description="86 Enterprise contracts · 856 Standard"
          icon={<Users className="h-5 w-5" />}
        />

        {/* Card 4: Overdue Invoices */}
        <StatCard
          title="Overdue Invoices"
          value="14"
          change={-4.8}
          trend="down"
          changePeriod="vs last month"
          accentColor="coral"
          badgeText="Action Required"
          description="$4,280 pending recovery · 3 in dunning"
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {/* ================= 5. ANALYTICS SECTION ================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <SubscriptionChart />
      </div>

      {/* ================= 6. RECENT SUBSCRIPTIONS TABLE ================= */}
      <section className="space-y-3">
        <RecentSubscriptionsTable
          initialData={subscriptions}
          onToast={showToast}
        />
      </section>

      {/* ================= 7. RECENT INVOICES TABLE ================= */}
      <section className="space-y-3">
        <RecentInvoicesTable
          initialData={invoices}
          onToast={showToast}
        />
      </section>

      {/* ================= CREATE SUBSCRIPTION MODAL ================= */}
      <Dialog open={newSubModalOpen} onOpenChange={setNewSubModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-2 border border-indigo-100">
              <Plus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create New Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set up a recurring subscription for an existing or new customer account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubscription} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Customer Organization Name</label>
              <Input
                required
                value={newSubCustomer}
                onChange={(e) => setNewSubCustomer(e.target.value)}
                placeholder="e.g. Stripe Systems, Alpha Capital"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Plan Tier</label>
                <select
                  value={newSubPlan}
                  onChange={(e) => setNewSubPlan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Enterprise Dedicated">Enterprise Dedicated</option>
                  <option value="Growth Scale">Growth Scale</option>
                  <option value="Starter Team">Starter Team</option>
                  <option value="AI Predictive Intelligence">AI Predictive Intelligence</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Billing Cycle</label>
                <select
                  value={newSubCycle}
                  onChange={(e) => setNewSubCycle(e.target.value as "Monthly" | "Annual")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual (20% discount)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Recurring Amount ($ USD)</label>
              <Input
                type="number"
                required
                value={newSubAmount}
                onChange={(e) => setNewSubAmount(e.target.value)}
                placeholder="499"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <DialogFooter className="border-t pt-4 border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNewSubModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Activate Subscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= CREATE INVOICE MODAL ================= */}
      <Dialog open={newInvModalOpen} onOpenChange={setNewInvModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-2 border border-indigo-100">
              <Receipt className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Generate New Invoice
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Issue an on-demand billing run or one-time platform contract invoice.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Customer Name</label>
              <Input
                required
                value={newInvCustomer}
                onChange={(e) => setNewInvCustomer(e.target.value)}
                placeholder="e.g. Acme Technologies Inc."
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Contract Line Item Description</label>
              <Input
                required
                value={newInvDescription}
                onChange={(e) => setNewInvDescription(e.target.value)}
                placeholder="Enterprise Platform Annual Contract"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Invoice Amount ($ USD)</label>
              <Input
                type="number"
                required
                value={newInvAmount}
                onChange={(e) => setNewInvAmount(e.target.value)}
                placeholder="1200"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <DialogFooter className="border-t pt-4 border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNewInvModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Issue Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= FLOATING TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
