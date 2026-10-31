import Link from "next/link";
import { Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-lg">
            <Zap className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#171717]">
            {APP_NAME}
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            Enterprise Subscription & Recurring Revenue Engine
          </p>
        </div>

        <div className="rounded-[20px] border border-[#EAECEF] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#171717]">Sign in to your account</h3>
            <p className="text-xs text-[#737373]">
              Enter your corporate credentials to access the telemetry dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-[#171717]"
              >
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                defaultValue="admin@subscriptiq.io"
                disabled
                className="bg-[#F5F6F8] border-[#EAECEF] rounded-xl text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-[#171717]"
                >
                  Password
                </label>
                <span className="text-xs text-indigo-600 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <Input
                id="password"
                type="password"
                defaultValue="••••••••••••"
                disabled
                className="bg-[#F5F6F8] border-[#EAECEF] rounded-xl text-xs h-10"
              />
            </div>

            <Button
              asChild
              className="w-full bg-[#171717] hover:bg-black text-white h-10 rounded-xl gap-2 mt-2 shadow-sm font-semibold"
            >
              <Link href="/dashboard">
                <span>Access Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-[#737373]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>SOC2 Type II & PCI-DSS Level 1 Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
