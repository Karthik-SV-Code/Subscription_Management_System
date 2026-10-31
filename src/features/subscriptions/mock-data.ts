import { Subscription } from "@/types/subscription";

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub_01HX9M001",
    customerId: "cust_01HX9J1Q7M001",
    customerName: "Acme Technologies Inc.",
    customerEmail: "billing@acme-tech.com",
    status: "active",
    currentPeriodStart: "2024-06-01T00:00:00Z",
    currentPeriodEnd: "2024-07-01T00:00:00Z",
    cancelAtPeriodEnd: false,
    mrr: 299,
    currency: "USD",
    items: [
      {
        id: "si_01",
        subscriptionId: "sub_01HX9M001",
        planId: "plan_growth_monthly",
        planName: "Growth Scale",
        unitAmount: 299,
        quantity: 1,
      },
    ],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "sub_01HX9M002",
    customerId: "cust_01HX9J1Q7M002",
    customerName: "Nexus Cloud Dynamics",
    customerEmail: "finance@nexuscloud.io",
    status: "trialing",
    currentPeriodStart: "2024-06-10T00:00:00Z",
    currentPeriodEnd: "2024-06-24T00:00:00Z",
    trialStart: "2024-06-10T00:00:00Z",
    trialEnd: "2024-06-24T00:00:00Z",
    cancelAtPeriodEnd: false,
    mrr: 4800,
    currency: "USD",
    items: [
      {
        id: "si_02",
        subscriptionId: "sub_01HX9M002",
        planId: "plan_enterprise_annual",
        planName: "Enterprise Dedicated",
        unitAmount: 9900,
        quantity: 1,
      },
    ],
    createdAt: "2024-06-10T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
  },
];

