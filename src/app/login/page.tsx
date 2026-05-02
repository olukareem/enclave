"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import type { Role } from "@/lib/types";

// Demo accounts seeded by db/migrations/0004_demo_users.sql.
// Buyers should remove or rotate these before going to production.
const DEMO_PASSWORD = "enclave-demo";

interface DemoAccount {
  email: string;
  full_name: string;
  role: Role;
  blurb: string;
  entityNames: string[];
}

const demoAccounts: DemoAccount[] = [
  {
    email: "sarah.chen@enclave.demo",
    full_name: "Sarah Chen",
    role: "admin",
    blurb: "Direct admin on two operating entities. Can read and write everything within them.",
    entityNames: ["Acme Holdings LLC", "Northwind Capital Group"],
  },
  {
    email: "mike.torres@enclave.demo",
    full_name: "Mike Torres",
    role: "viewer",
    blurb: "Read-only viewer on a single founder-stage entity. Sees data; cannot mutate.",
    entityNames: ["Torres Ventures"],
  },
  {
    email: "alex.park@enclave.demo",
    full_name: "Alex Park",
    role: "advisor",
    blurb: "Outside advisor with read access across three trust-and-fund entities.",
    entityNames: ["Acme Holdings LLC", "Riverside Trust", "Chen Family Office"],
  },
];

const roleColor: Record<Role, "default" | "warning" | "slate"> = {
  admin: "default",
  advisor: "warning",
  viewer: "slate",
};

export default function LoginPage() {
  const router = useRouter();
  const { signIn, currentUser, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && currentUser) router.replace("/dashboard");
  }, [ready, currentUser, router]);

  async function handleDemoLogin(account: DemoAccount) {
    setError(null);
    setSigningIn(account.email);
    const { error: signInError } = await signIn(account.email, DEMO_PASSWORD);
    setSigningIn(null);
    if (signInError) {
      setError(
        `Sign-in failed: ${signInError}. Have you run all four db/migrations/ files? See README.`,
      );
      return;
    }
    router.push("/dashboard");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setSigningIn("form");
    const { error: signInError } = await signIn(email, password);
    setSigningIn(null);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="space-y-6 p-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 grid-cols-2 gap-[2px]">
                  <div className="rounded-[2px] bg-primary" />
                  <div className="rounded-[2px] bg-slate-800" />
                  <div className="rounded-[2px] bg-slate-800" />
                  <div className="rounded-[2px] bg-primary/55" />
                </div>
                <span className="text-sm font-semibold">enclave</span>
              </div>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your work email to access your entities, documents, and reports.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={signingIn === "form"}>
                {signingIn === "form" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {error}
              </div>
            ) : null}

            <div className="rounded-md border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Demo credentials are public.</span>{" "}
              Rotate or delete the seeded users before deploying to real customers.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Demo accounts
            </div>
            <p className="text-sm text-muted-foreground">
              Each account has different entity memberships and roles. Switching between them is the
              clearest way to see RLS at work.
            </p>

            <Separator />

            <div className="space-y-3">
              {demoAccounts.map((d) => (
                <button
                  key={d.email}
                  onClick={() => handleDemoLogin(d)}
                  disabled={signingIn !== null}
                  className="group flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">{initials(d.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{d.full_name}</span>
                      <Badge variant={roleColor[d.role]} className="capitalize">
                        {d.role}
                      </Badge>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{d.email}</div>
                    <div className="mt-1.5 text-xs text-muted-foreground">{d.blurb}</div>
                    <div className="mt-1.5 text-[11px] uppercase tracking-wide text-muted-foreground/80">
                      {d.entityNames.length} {d.entityNames.length === 1 ? "entity" : "entities"}:{" "}
                      <span className="normal-case text-muted-foreground">
                        {d.entityNames.join(" · ")}
                      </span>
                    </div>
                  </div>
                  {signingIn === d.email ? (
                    <Loader2 className="mt-2 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              All three users share the password{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                {DEMO_PASSWORD}
              </code>
              . Tenant isolation is enforced by Postgres RLS — switching accounts changes what the
              database returns, not what the client filters.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
