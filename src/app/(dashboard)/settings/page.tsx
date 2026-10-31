import * as React from "react";
import { Settings, Key, Shield, Bell, Webhook } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Settings & Configuration",
};

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Organization & Billing Profile",
      description: "Company legal name, billing address, tax identification, and default currency.",
      icon: <Settings className="h-5 w-5 text-indigo-600" />,
      status: "Ready",
    },
    {
      title: "API Keys & Developer Access",
      description: "REST API tokens, webhook endpoints, secret keys, and SDK authentication.",
      icon: <Key className="h-5 w-5 text-indigo-600" />,
      status: "Configured",
    },
    {
      title: "Webhook Integrations",
      description: "Real-time subscription and invoice events delivery to downstream services.",
      icon: <Webhook className="h-5 w-5 text-indigo-600" />,
      status: "Ready",
    },
    {
      title: "Team Permissions & RBAC",
      description: "Role-based access control, administrator seats, and auditor logs.",
      icon: <Shield className="h-5 w-5 text-indigo-600" />,
      status: "Ready",
    },
    {
      title: "Notifications & Alerts",
      description: "Automated dunning failure alerts, high-value churn notifications, and webhooks.",
      icon: <Bell className="h-5 w-5 text-indigo-600" />,
      status: "Ready",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Platform Configuration"
        description="Configure organization billing preferences, developer API tokens, security, and integrations."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card
            key={section.title}
            className="border-slate-200/80 bg-white transition-all hover:border-indigo-200 hover:shadow-sm"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </div>
              <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-600">
                {section.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-slate-500 pt-1">
                {section.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

