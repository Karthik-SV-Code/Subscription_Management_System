# SubscriptIQ — Enterprise Subscription & Recurring Revenue Management Platform

SubscriptIQ is an enterprise-grade Subscription and Recurring Revenue Management Platform built with Next.js App Router, React, TypeScript (strict mode), and Tailwind CSS.

---

## 1. Architectural Stack

- **Framework**: Next.js 14 (App Router, Server Components by default, Route Groups)
- **Language**: TypeScript (strict mode, path aliases `@/*`)
- **Styling**: Tailwind CSS & custom design tokens
- **Component Primitives**: shadcn/ui & Radix UI
- **Icons**: Lucide React
- **Analytics & Charts**: Recharts
- **State & Data Fetching**: TanStack React Query v5
- **Form Management & Validation**: React Hook Form & Zod
- **Backend Integration**: Safe Supabase JS SDK + Custom REST `ApiClient` abstraction
- **Date Utilities**: `date-fns`

---

## 2. Directory Architecture

```text
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── plans/page.tsx
│   │   │   ├── subscriptions/page.tsx
│   │   │   ├── invoices/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   ├── discounts/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── dashboard-shell.tsx
│   │   ├── shared/
│   │   │   ├── page-header.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── loading-skeleton.tsx
│   │   │   └── confirm-dialog.tsx
│   │   ├── charts/
│   │   │   ├── revenue-chart.tsx
│   │   │   └── subscription-chart.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── skeleton.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── avatar.tsx
│   ├── features/
│   │   ├── customers/
│   │   │   ├── components/customer-status-badge.tsx
│   │   │   ├── services.ts
│   │   │   ├── types.ts
│   │   │   └── mock-data.ts
│   │   ├── products/
│   │   │   ├── components/product-tier-badge.tsx
│   │   │   ├── services.ts
│   │   │   ├── types.ts
│   │   │   └── mock-data.ts
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   ├── payments/
│   │   └── discounts/
│   ├── hooks/
│   │   ├── use-debounce.ts
│   │   └── use-disclosure.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── supabase.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── providers/
│   │   └── query-provider.tsx
│   └── types/
│       ├── customer.ts
│       ├── product.ts
│       ├── subscription.ts
│       ├── invoice.ts
│       └── common.ts
├── .env.example
├── .gitignore
├── components.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Design System Tokens

- **Primary Accent**: Indigo `#4F46E5`
- **Sidebar**: Deep Navy `#111827`
- **Background**: Neutral Gray `#F8FAFC`
- **Surface / Card**: Pure White `#FFFFFF`
- **Text**: Slate `#0F172A`
- **Secondary Text**: Slate `#64748B`
- **Success**: Green `#16A34A`
- **Warning**: Amber `#D97706`
- **Error / Destructive**: Red `#DC2626`

---

## 4. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configurable parameters:
- `NEXT_PUBLIC_APP_URL`: Base application URL.
- `NEXT_PUBLIC_API_URL`: Backend REST API endpoint.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (safe fallback included).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (safe fallback included).
- `NEXT_PUBLIC_ENABLE_MOCK_DATA`: Set to `true` for standalone hackathon development.

---

## 5. Development & Build Scripts

```bash
# Start local development server
npm run dev

# Run production build and type checking
npm run build

# Start production server
npm run start
```

