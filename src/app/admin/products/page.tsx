"use client";

import * as React from "react";
import {
  Layers,
  Search,
  CheckCircle2,
  DollarSign,
  Tag,
  Plus,
  Eye,
  Download,
  Filter,
  Shield,
  Zap,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, downloadCSV } from "@/lib/utils";

interface AdminProduct {
  id: string;
  name: string;
  code: string;
  status: "active" | "draft" | "archived";
  category: string;
  activeSubscribers: number;
  mrrGenerated: number;
  plans: {
    name: string;
    amount: number;
    interval: string;
    pricingModel: string;
    subscribers: number;
  }[];
}

const MOCK_PRODUCTS: AdminProduct[] = [
  {
    id: "prod_01",
    name: "Enterprise Dedicated Cloud",
    code: "ENT-CLOUD-01",
    status: "active",
    category: "Infrastructure",
    activeSubscribers: 142,
    mrrGenerated: 38400,
    plans: [
      {
        name: "Enterprise Dedicated Annual",
        amount: 9600,
        interval: "year",
        pricingModel: "flat_fee",
        subscribers: 86,
      },
      {
        name: "Enterprise Suite Quarterly",
        amount: 3200,
        interval: "quarter",
        pricingModel: "flat_fee",
        subscribers: 56,
      },
    ],
  },
  {
    id: "prod_02",
    name: "SubscriptIQ Growth Engine",
    code: "GROWTH-SCALE",
    status: "active",
    category: "SaaS Application",
    activeSubscribers: 480,
    mrrGenerated: 18900,
    plans: [
      {
        name: "Growth Scale Monthly",
        amount: 499,
        interval: "month",
        pricingModel: "flat_fee",
        subscribers: 340,
      },
      {
        name: "Growth Pro Annual",
        amount: 4990,
        interval: "year",
        pricingModel: "flat_fee",
        subscribers: 140,
      },
    ],
  },
  {
    id: "prod_03",
    name: "Predictive Intelligence Addon",
    code: "AI-PREDICT-SUITE",
    status: "active",
    category: "AI & ML",
    activeSubscribers: 220,
    mrrGenerated: 8400,
    plans: [
      {
        name: "Predictive Intelligence Monthly",
        amount: 799,
        interval: "month",
        pricingModel: "usage_based",
        subscribers: 220,
      },
    ],
  },
  {
    id: "prod_04",
    name: "Developer Seat Packs",
    code: "SEAT-PACK-DEV",
    status: "active",
    category: "Expansion Units",
    activeSubscribers: 442,
    mrrGenerated: 2750,
    plans: [
      {
        name: "Additional Seat ($50/seat)",
        amount: 50,
        interval: "month",
        pricingModel: "per_seat",
        subscribers: 442,
      },
    ],
  },
];

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState<AdminProduct | null>(null);

  const filteredProducts = React.useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const handleExport = () => {
    const rows = filteredProducts.map((p) => ({
      Code: p.code,
      Name: p.name,
      Category: p.category,
      Status: p.status,
      ActiveSubscribers: p.activeSubscribers,
      MRR: p.mrrGenerated,
      PlansCount: p.plans.length,
    }));
    downloadCSV(
      `subscriptiq_admin_products_${new Date().toISOString().slice(0, 10)}`,
      rows as unknown as Record<string, unknown>[]
    );
  };

  return (
    <>
      <AdminHeader
        title="Product & Plan Overview"
        subtitle="Monetization catalogs, subscription plans, billing cadences, and pricing models"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter catalog by product name or SKU..."
        onExportCSV={handleExport}
      />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Active Products
            </span>
            <div className="text-3xl font-extrabold text-[#171717] mt-3">4</div>
            <div className="text-xs text-[#737373] mt-1">Monetized catalog lines</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Active Plans
            </span>
            <div className="text-3xl font-extrabold text-purple-600 mt-3">6</div>
            <div className="text-xs text-[#737373] mt-1">Annual, Monthly & Tiered</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Top Revenue Driver
            </span>
            <div className="text-lg font-extrabold text-indigo-700 mt-3 truncate">
              Enterprise Dedicated
            </div>
            <div className="text-xs text-[#737373] mt-1">56% of total MRR</div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Expansion Addons
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-3">
              $11,150
            </div>
            <div className="text-xs text-[#737373] mt-1">Seats & AI API MRR</div>
          </div>
        </div>

        {/* Product Catalog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white p-6 rounded-[20px] border border-[#EAECEF] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAECEF]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-[11px] font-mono text-[#737373] uppercase">
                      {prod.code}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active Catalog
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="text-base font-bold text-[#171717]">{prod.name}</h4>
                  <div className="text-xs text-[#737373] mt-0.5">{prod.category}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-[14px] bg-[#F5F6F8]">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#737373]">
                      Subscribers
                    </div>
                    <div className="text-sm font-bold text-[#171717] mt-0.5">
                      {prod.activeSubscribers} clients
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#737373]">
                      Monthly MRR
                    </div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">
                      {formatCurrency(prod.mrrGenerated)}/mo
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold text-[#171717]">
                    Active Pricing Plans ({prod.plans.length})
                  </div>
                  {prod.plans.map((pl, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-[12px] border border-[#EAECEF] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#171717]">{pl.name}</div>
                        <div className="text-[10px] text-[#737373] capitalize">
                          {pl.pricingModel.replace("_", " ")} • {pl.subscribers} subscribers
                        </div>
                      </div>
                      <div className="font-bold text-[#171717]">
                        {formatCurrency(pl.amount)}/{pl.interval}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAECEF] flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(prod)}
                  className="rounded-[10px] text-xs font-semibold border-[#EAECEF]"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Inspect Catalog Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Catalog Inspector Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#171717]">
              Product & Plan Definition
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Billing engine rules and plan configuration
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  Product Name
                </div>
                <div className="text-base font-bold text-[#171717]">
                  {selectedProduct.name}
                </div>
                <div className="text-xs font-mono text-[#737373] mt-0.5">
                  SKU: {selectedProduct.code}
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[#F5F6F8] border border-[#EAECEF]">
                <div className="text-[10px] uppercase font-bold text-[#737373]">
                  MRR Attribution
                </div>
                <div className="text-base font-bold text-emerald-700 mt-0.5">
                  {formatCurrency(selectedProduct.mrrGenerated)} / month
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-[10px]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

