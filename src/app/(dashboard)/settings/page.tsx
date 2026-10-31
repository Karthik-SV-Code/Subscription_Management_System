import * as React from "react";
import { Settings, Key, Shield, Bell, Webhook, Database } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Settings & Configuration",
};

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Organization & Billing Profile",
      description: "Company legal entity, tax registration, and primary billing currency.",
      icon: <Settings className="h-5 w-5 text-[#171717]" />,
      value: "SubscriptIQ Technologies Ltd.",
      status: "Active",
    },
    {
      title: "REST API Endpoint & Tokens",
      description: "Secure gateway tokens for external REST microservices integration.",
      icon: <Key className="h-5 w-5 text-indigo-600" />,
      value: "http://localhost:8000/api/v1",
      status: "Configured",
    },
    {
      title: "Supabase Backend Synchronization",
      description: "Relational database synchronization and session token validation.",
      icon: <Database className="h-5 w-5 text-purple-600" />,
      value: "Safe Fallback / Dev Ready",
      status: "Operational",
    },
    {
      title: "Webhook Subscriptions",
      description: "Real-time subscription, customer, and invoice events delivery.",
      icon: <Webhook className="h-5 w-5 text-emerald-600" />,
      value: "14 event listeners active",
      status: "Connected",
    },
    {
      title: "Team Permissions & RBAC",
      description: "Role-based access control, administrator seats, and auditor logs.",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      value: "Enterprise Single Sign-On (SSO)",
      status: "Enforced",
    },
    {
      title: "Smart Dunning Notifications",
      description: "Automated payment failure recovery retry cadence and emails.",
      icon: <Bell className="h-5 w-5 text-amber-600" />,
      value: "3-day / 5-day / 7-day retry cadence",
      status: "Enabled",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings & Architecture"
        description="Configure organization billing preferences, developer API tokens, security, and webhook delivery."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-[#EAECEF]">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">{section.title}</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-[#171717] border border-[#EAECEF]">
                  {section.status}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                {section.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#EAECEF] flex items-center justify-between text-xs">
              <span className="text-[#737373] font-medium">Status</span>
              <span className="font-mono font-semibold text-[#171717]">{section.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
