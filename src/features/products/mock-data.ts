import { Product } from "@/types/product";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_01HX9K001",
    name: "SubscriptIQ Core SaaS Suite",
    code: "SUB-CORE",
    description: "Complete subscription management and billing automation platform",
    status: "active",
    plansCount: 3,
    activeSubscriptionsCount: 420,
    features: [
      "Automated Invoicing & Tax",
      "Stripe & Paddle Gateway Sync",
      "Customer Self-Service Portal",
      "Basic Revenue Analytics",
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-05-01T00:00:00Z",
  },
  {
    id: "prod_01HX9K002",
    name: "Revenue Intelligence Engine",
    code: "REV-AI",
    description: "Predictive churn mitigation and dynamic MRR expansion forecasting",
    status: "active",
    plansCount: 2,
    activeSubscriptionsCount: 180,
    features: [
      "AI Churn Prediction",
      "Cohort Retention Modeling",
      "Custom Executive Reports",
      "Automated Dunning Campaigns",
    ],
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
];

