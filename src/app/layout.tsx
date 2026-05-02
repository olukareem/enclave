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
    default: "Enclave — Multi-tenant client portal infrastructure",
    template: "%s — Enclave",
  },
  description:
    "Multi-tenant B2B client portal starter: Postgres RLS, role-based access, Vercel Blob document storage. Built on Next.js 14, Neon, and Auth.js.",
  icons: {
    icon: "/brand/mark.svg",
  },
  openGraph: {
    title: "Enclave — Multi-tenant client portal infrastructure",
    description: "Ship a multi-tenant client portal in days, not months.",
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
