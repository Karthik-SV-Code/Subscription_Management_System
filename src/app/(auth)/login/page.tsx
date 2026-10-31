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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Zap className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Welcome to {APP_NAME}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enterprise Subscription & Recurring Revenue Engine
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your work email and password to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                defaultValue="admin@subscriptiq.io"
                disabled
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Password
                </label>
                <span className="text-xs text-indigo-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <Input
                id="password"
                type="password"
                defaultValue="••••••••••••"
                disabled
              />
            </div>

            <Button
              asChild
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 mt-2"
            >
              <Link href="/dashboard">
                <span>Access Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>SOC2 Type II & PCI-DSS Level 1 Encrypted</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

