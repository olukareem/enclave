"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChartLine,
  FileText,
  Landmark,
  Lock,
  ScrollText,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <FeatureGrid />
      <CallToAction />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 grid-cols-2 gap-[2px]">
            <div className="rounded-[2px] bg-primary" />
            <div className="rounded-[2px] bg-slate-900" />
            <div className="rounded-[2px] bg-slate-900" />
            <div className="rounded-[2px] bg-primary/55" />
          </div>
          <span className="text-sm font-semibold tracking-tight">enclave</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#who-its-for" className="hover:text-foreground">
            Who it&rsquo;s for
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/login">
              Sign in
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Lock className="h-3.5 w-3.5" />
            Private workspace for every client
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One portal for every entity you manage.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Documents, transactions, assets, and obligations for each of your clients,
            kept strictly separate. Admins, advisors, and viewers each see exactly what
            their role allows. Nothing more.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Already a member? Sign in with your work email.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What members get
            </div>
            <ul className="space-y-3 text-sm">
              <Bullet>A workspace per entity, with role-based access for every relationship</Bullet>
              <Bullet>Document storage with one-click signed sharing links</Bullet>
              <Bullet>Transaction ledgers, asset registers, and obligation calendars</Bullet>
              <Bullet>Auditable activity &mdash; every member sees who uploaded what</Bullet>
              <Bullet>Tenant isolation enforced at the database, not the application layer</Bullet>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

function FeatureGrid() {
  return (
    <section id="features" className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            Everything an entity needs in one place.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Built for advisors and operators who work across a portfolio of clients.
            Switch entities from a single sign-in &mdash; your access changes with you.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={FileText}
            title="Documents"
            body="Upload, organize, and share files per entity. Signed download links keep distribution traceable, and only admins of an entity can add new documents."
          />
          <FeatureCard
            icon={Wallet}
            title="Transactions"
            body="A running ledger of income, expenses, and transfers across each entity. Filter by status, date range, or counterparty &mdash; export anytime."
          />
          <FeatureCard
            icon={Landmark}
            title="Assets &amp; obligations"
            body="Track holdings, valuations, loans, leases, and recurring commitments. Stay ahead of due dates with the obligations calendar."
          />
          <FeatureCard
            icon={ChartLine}
            title="Live overview"
            body="A dashboard for each entity surfacing recent activity, asset totals, and net flow over the last 30 days."
          />
          <FeatureCard
            icon={ScrollText}
            title="Role-based access"
            body="Admins manage memberships and uploads. Advisors and viewers read what they&rsquo;re assigned and nothing else &mdash; enforced at the database."
          />
          <FeatureCard
            icon={Lock}
            title="Private by default"
            body="Every query is scoped to the entities you belong to. There is no &lsquo;all clients&rsquo; query. Forget the where-clause and the database returns nothing."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function CallToAction() {
  return (
    <section id="who-its-for" className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Made for advisors who manage many.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Family offices, accounting firms, fund administrators, fractional CFOs.
              Anyone who works across a portfolio of clients and needs each one&rsquo;s
              data kept distinct, organized, and auditable.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Each member sees only the entities they belong to. Each role &mdash; admin,
              advisor, viewer &mdash; gets exactly the privileges that fit. The boundary
              isn&rsquo;t a UI rule; it&rsquo;s a database rule.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/login">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-4 p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Built for
              </div>
              <ul className="space-y-3 text-sm">
                <Bullet>Family offices managing trusts and operating entities</Bullet>
                <Bullet>Accountants serving a roster of small businesses</Bullet>
                <Bullet>Fund admins coordinating LPs, GPs, and side letters</Bullet>
                <Bullet>Fractional CFOs juggling several startups at once</Bullet>
                <Bullet>Law firms tracking matters across separate clients</Bullet>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
        <span>&copy; Enclave</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#who-its-for" className="hover:text-foreground">
            Who it&rsquo;s for
          </a>
        </div>
      </div>
    </footer>
  );
}
