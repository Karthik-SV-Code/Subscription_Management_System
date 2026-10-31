export const APP_NAME = "SubscriptIQ";
export const APP_TAGLINE = "Enterprise Subscription & Recurring Revenue Management";
export const APP_DESCRIPTION =
  "Modern, enterprise-grade subscription billing, customer lifecycle, and recurring revenue intelligence platform.";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    description: "Revenue metrics, active subscriptions, and executive summary",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: "Users",
    description: "Customer accounts, payment profiles, and account lifecycle",
  },
  {
    title: "Products",
    href: "/products",
    icon: "Package",
    description: "Product catalog, features, and service entitlements",
  },
  {
    title: "Plans",
    href: "/plans",
    icon: "Layers",
    description: "Pricing tiers, billing cadences, and plan configurations",
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: "Repeat",
    description: "Active contracts, upgrades, downgrades, and renewals",
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: "Receipt",
    description: "Billing runs, invoice generation, and receivables",
  },
  {
    title: "Payments",
    href: "/payments",
    icon: "CreditCard",
    description: "Transactions, refund logs, and gateway integrations",
  },
  {
    title: "Discounts",
    href: "/discounts",
    icon: "Tag",
    description: "Promotional codes, volume discounts, and coupon management",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
    description: "Billing rules, team permissions, webhook setup, and API keys",
  },
];

export const STATUS_CONFIG = {
  active: {
    label: "Active",
    variant: "success",
  },
  trialing: {
    label: "Trialing",
    variant: "primary",
  },
  past_due: {
    label: "Past Due",
    variant: "warning",
  },
  canceled: {
    label: "Canceled",
    variant: "destructive",
  },
  paused: {
    label: "Paused",
    variant: "secondary",
  },
  paid: {
    label: "Paid",
    variant: "success",
  },
  open: {
    label: "Open",
    variant: "primary",
  },
  void: {
    label: "Void",
    variant: "secondary",
  },
  uncollectible: {
    label: "Uncollectible",
    variant: "destructive",
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

