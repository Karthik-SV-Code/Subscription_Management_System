"use client";

import * as React from "react";
import {
  Settings,
  Shield,
  Key,
  Bell,
  Database,
  CheckCircle2,
  Lock,
  Globe,
  Save,
  RefreshCw,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = React.useState("3");
  const [dunningDays, setDunningDays] = React.useState("7");
  const [enforce2FA, setEnforce2FA] = React.useState(true);
  const [auditRetention, setAuditRetention] = React.useState("365");
  const [webhookUrl, setWebhookUrl] = React.useState("https://api.subscriptiq.io/v1/webhooks/stripe");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Admin configurations saved and synced across cluster nodes.");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <>
      <AdminHeader
        title="Admin Settings & Platform Security"
        subtitle="Payment gateway credentials, billing retry policies, dunning schedules, and compliance"
      />

      <main className="flex-1 p-4 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
        {feedback && (
          <div className="p-3.5 rounded-[16px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ {feedback}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Security & Compliance */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EAECEF]">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-[#171717]">
                Access Security & Two-Factor Authentication
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div>
                  <div className="font-bold text-[#171717]">
                    Mandatory 2FA Enforcement
                  </div>
                  <div className="text-[#737373] mt-0.5">
                    Require TOTP authentication for Super Admin, Admin, and Finance roles
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enforce2FA}
                    onChange={(e) => setEnforce2FA(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#171717]"></div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Audit Trail Log Retention Period
                </label>
                <select
                  value={auditRetention}
                  onChange={(e) => setAuditRetention(e.target.value)}
                  className="w-full h-10 px-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF] text-xs text-[#171717]"
                >
                  <option value="90">90 Days (Standard SaaS Compliance)</option>
                  <option value="365">1 Year (SOC2 Type II Standard)</option>
                  <option value="2555">7 Years (Financial / Tax Regulatory Standard)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Billing & Dunning Automation */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EAECEF]">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#171717]">
                Smart Retries & Automated Dunning
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Card Charge Retry Attempts
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={retryAttempts}
                  onChange={(e) => setRetryAttempts(e.target.value)}
                  className="h-10 rounded-[12px] bg-[#F5F6F8] border-[#EAECEF]"
                />
                <span className="text-[10px] text-[#737373] mt-1 block">
                  Intelligent retry scheduling using machine learning
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Grace Period Before Pausing (Days)
                </label>
                <Input
                  type="number"
                  min="3"
                  max="30"
                  value={dunningDays}
                  onChange={(e) => setDunningDays(e.target.value)}
                  className="h-10 rounded-[12px] bg-[#F5F6F8] border-[#EAECEF]"
                />
                <span className="text-[10px] text-[#737373] mt-1 block">
                  Subscription paused automatically when unpaid after grace period
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Webhook & Integration Endpoints */}
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EAECEF]">
              <Key className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-[#171717]">
                Payment Gateway & Webhook Endpoints
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Production Webhook URL
                </label>
                <Input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="h-10 rounded-[12px] bg-[#F5F6F8] border-[#EAECEF] font-mono text-xs"
                />
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#171717]">
                    Stripe Webhook Secret
                  </div>
                  <div className="font-mono text-[11px] text-[#737373] mt-0.5">
                    whsec_••••••••••••••••••••••••••••39ab
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-[#171717] hover:bg-black text-white h-10 px-5 rounded-[12px] font-bold text-xs shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Platform Settings
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

