import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Enclave — One portal for every entity you manage",
    template: "%s — Enclave",
  },
  description:
    "A private workspace for advisors, family offices, and accountants managing multiple clients. Documents, transactions, assets, and obligations kept distinct per entity.",
  icons: {
    icon: "/brand/mark.svg",
  },
  openGraph: {
    title: "Enclave — One portal for every entity you manage",
    description:
      "Private client workspaces for advisors, family offices, and accountants managing multiple entities.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`} style={{ fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif" }}>
        {/* SessionProvider (Auth.js) must wrap useSession() callers.
            AuthProvider reads the session and adds entity-selection state. */}
        <SessionProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
