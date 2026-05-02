"use client";

import Link from "next/link";
import { ArrowRight, Database, FileLock2, Github, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <FeatureGrid />
      <SchemaSection />
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
          <a href="#schema" className="hover:text-foreground">
            Schema
          </a>
          <Link href="/login" className="hover:text-foreground">
            Demo
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/login">
              Try the demo
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
            <ShieldCheck className="h-3.5 w-3.5" />
            Postgres RLS, end to end
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Multi-tenant client portal infrastructure.
            <br />
            <span className="text-muted-foreground">Ship in days, not months.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            A B2B portal starter where tenant isolation is enforced by Postgres, not faked in
            JavaScript. Real auth, real RLS policies, Vercel Blob document storage. Built on
            Next.js 14, Neon, and Auth.js.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Try the live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Three demo accounts. Switch between admin, viewer, and advisor to watch the visible
            data change at the database layer.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What ships in the repo
            </div>
            <ul className="space-y-3 text-sm">
              <Bullet>Seven-table schema modeling many-to-many user/entity membership with role per relationship</Bullet>
              <Bullet>Deployable RLS policies as SQL migrations — same predicate enforced on every read and write</Bullet>
              <Bullet>Auth.js v5 (email + password) with three seeded demo users via bcrypt</Bullet>
              <Bullet>Vercel Blob document storage with entity-gated uploads</Bullet>
              <Bullet>Schema viewer + RLS demo pages — visual proof that policies do what they say</Bullet>
              <Bullet>Tailwind + shadcn/ui design system, responsive down to 375px</Bullet>
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
            What makes this different from every other Next.js starter
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Most multi-tenant starters filter rows in the application layer. That breaks the moment
            a developer forgets a where-clause. Enclave enforces isolation at the database — every
            query is RLS-gated whether the developer remembers or not.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Users}
            title="Many-to-many memberships"
            body="A junction table (user_entity) lets one user belong to many entities with a role per relationship. Admins of one entity are not admins of another."
          />
          <FeatureCard
            icon={Database}
            title="Postgres-native isolation"
            body="Every domain table has an RLS policy that filters by the entity_ids the authenticated user belongs to. Forget the where-clause? Postgres still returns nothing."
          />
          <FeatureCard
            icon={FileLock2}
            title="Entity-gated document storage"
            body="Files are uploaded to Vercel Blob via a server route that enforces admin membership before accepting any file. The same Postgres rule guards both the metadata row and the upload."
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
  body: string;
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

function SchemaSection() {
  return (
    <section id="schema" className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Seven tables. One access core.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Every domain table — documents, transactions, assets, obligations — joins back to{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">user_entity</code>{" "}
              through <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">entity_id</code>.
              That single column is what the Postgres RLS policy keys on.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              The{" "}
              <Link href="/dashboard/schema" className="font-medium text-primary hover:underline">
                Schema viewer
              </Link>{" "}
              page renders the full diagram with FK arrows and lets you click a table to read its
              policy in plain English plus the deployable SQL.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/login">
                  Try the demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-4 p-6">
              <SchemaDiagram />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// Compact static SVG mirroring the schema viewer page's relationships.
function SchemaDiagram() {
  return (
    <svg
      viewBox="0 0 400 280"
      className="h-auto w-full"
      role="img"
      aria-label="Schema diagram showing user_entity at the center"
    >
      {/* connecting lines */}
      <g stroke="hsl(var(--border))" strokeWidth="1" fill="none">
        <line x1="60" y1="60" x2="180" y2="60" />
        <line x1="220" y1="60" x2="340" y2="60" />
        <line x1="200" y1="80" x2="200" y2="130" />
        <line x1="60" y1="220" x2="180" y2="160" />
        <line x1="160" y1="220" x2="200" y2="170" />
        <line x1="240" y1="220" x2="200" y2="170" />
        <line x1="340" y1="220" x2="220" y2="160" />
      </g>
      {/* nodes */}
      <SchemaNode x={20} y={40} label="users" />
      <SchemaNode x={300} y={40} label="entities" />
      <SchemaNode x={170} y={130} label="user_entity" highlight />
      <SchemaNode x={20} y={210} label="documents" />
      <SchemaNode x={130} y={210} label="transactions" />
      <SchemaNode x={235} y={210} label="assets" />
      <SchemaNode x={335} y={210} label="obligations" />
    </svg>
  );
}

function SchemaNode({
  x,
  y,
  label,
  highlight,
}: {
  x: number;
  y: number;
  label: string;
  highlight?: boolean;
}) {
  const w = label.length * 7 + 18;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={0}
        y={0}
        width={w}
        height={28}
        rx={5}
        fill={highlight ? "hsl(var(--primary) / 0.12)" : "hsl(var(--card))"}
        stroke={highlight ? "hsl(var(--primary))" : "hsl(var(--border))"}
        strokeWidth={highlight ? 1.5 : 1}
      />
      <text
        x={w / 2}
        y={18}
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontSize="11"
        fill={highlight ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
        fontWeight={highlight ? 600 : 400}
      >
        {label}
      </text>
    </g>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
        <span>
          Enclave — built on Next.js 14 · Neon · Auth.js · Vercel Blob. MIT licensed for new owners to rebrand and
          resell.
        </span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/dashboard/schema" className="hover:text-foreground">
            Schema
          </Link>
          <Link href="/dashboard/rls-demo" className="hover:text-foreground">
            RLS demo
          </Link>
        </div>
      </div>
    </footer>
  );
}
