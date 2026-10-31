import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Subscription & Recurring Revenue Platform`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

