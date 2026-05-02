"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultSetTable } from "@/components/rls/result-set-table";
import { SqlPolicyBlock } from "@/components/rls/sql-policy-block";
import {
  ALEX_ID,
  MIKE_ID,
  SARAH_ID,
  assets as allAssets,
  documents as allDocuments,
  obligations as allObligations,
  transactions as allTransactions,
  users,
} from "@/lib/mock-data";
import { applyRLS } from "@/lib/mock-supabase";
import { policies, RLS_DEMO_TABLES, type RlsDemoTable } from "@/lib/rls-policies";
import { toast } from "@/lib/use-toast";
import type { Asset, Document, Obligation, Transaction } from "@/lib/types";

type DemoRow = Document | Transaction | Asset | Obligation;

const ALL_ROWS: Record<RlsDemoTable, readonly DemoRow[]> = {
  documents: allDocuments,
  transactions: allTransactions,
  assets: allAssets,
  obligations: allObligations,
};

const PRIMARY_USER_IDS = [SARAH_ID, MIKE_ID, ALEX_ID];

export default function RlsDemoPage() {
  const [tab, setTab] = useState<RlsDemoTable>("documents");
  const [pairLeft, setPairLeft] = useState<string>(SARAH_ID);
  const [pairRight, setPairRight] = useState<string>(MIKE_ID);

  const allRows = ALL_ROWS[tab];

  const leftUser = users.find((u) => u.id === pairLeft)!;
  const rightUser = users.find((u) => u.id === pairRight)!;

  // applyRLS infers Row<T> from the table name; cast back to DemoRow because
  // we already narrowed `tab` to the four demo tables.
  const leftRows = applyRLS(tab, allRows as never, pairLeft) as DemoRow[];
  const rightRows = applyRLS(tab, allRows as never, pairRight) as DemoRow[];

  const policy = policies[tab];

  async function tryWriteAsViewer() {
    // Call the real API — Postgres RLS will reject the insert if the session user
    // doesn't have write access (i.e. role != 'admin'). This is a genuine DB-level
    // violation, not a JS-side throw.
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "documents",
          row: {
            // Real deterministic UUIDs from 0003_seed.sql / 0004_demo_users.sql
            entity_id: "a0000000-0000-4000-8000-000000000005", // Torres Ventures
            title: "RLS write test — should be rejected",
            file_type: "pdf",
            file_size: 1024,
            storage_path: "/rls-test.pdf",
            uploaded_by: "b0000000-0000-4000-8000-000000000002", // Mike Torres
          },
        }),
      });

      if (res.status === 403) {
        const { error } = await res.json();
        toast({
          title: "Postgres rejected the insert (42501)",
          description: error ?? "RLS WITH CHECK policy blocked this write.",
          variant: "destructive",
        });
      } else if (res.ok) {
        toast({
          title: "Write succeeded — you are logged in as an admin",
          description: "Log in as Mike (viewer) to see the RLS violation.",
        });
      } else if (res.status === 401) {
        toast({ title: "Not authenticated", description: "Sign in first.", variant: "destructive" });
      } else {
        const { error } = await res.json();
        toast({ title: "Unexpected error", description: error ?? String(res.status), variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network error", description: String(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RLS demo</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The same query, run as two different users. Both panels call{" "}
          <span className="font-mono text-foreground">applyRLS()</span> — the same predicate the rest
          of this app uses, encoding the same rule the Postgres policy below would enforce in
          production.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Tabs value={tab} onValueChange={(v) => setTab(v as RlsDemoTable)}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Target table</div>
              <TabsList>
                {RLS_DEMO_TABLES.map((t) => (
                  <TabsTrigger key={t} value={t} className="font-mono text-xs">
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/20 p-3 text-xs">
            <span className="text-muted-foreground">Compare</span>
            <UserPicker users={users} value={pairLeft} onChange={setPairLeft} />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <UserPicker users={users} value={pairRight} onChange={setPairRight} />
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Querying</span>
            <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">
              SELECT * FROM {tab};
            </code>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <ResultSetTable user={leftUser} rows={leftRows} totalRows={allRows.length} />
        <ResultSetTable user={rightUser} rows={rightRows} totalRows={allRows.length} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">How the rule is enforced</h2>
            <p className="mt-1 text-xs text-muted-foreground">{policy.english}</p>
          </div>
          <SqlPolicyBlock sql={policy.selectSQL} />
          {policy.insertSQL ? <SqlPolicyBlock title="INSERT policy (admin only)" sql={policy.insertSQL} /> : null}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="flex items-start gap-3 p-5">
          <ShieldX className="h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Write enforcement</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Logged in as Mike (viewer)? Click the button — it attempts a real{" "}
              <span className="font-mono text-foreground">INSERT</span> through the{" "}
              <span className="font-mono text-foreground">/api/data</span> route. Postgres evaluates
              the{" "}
              <span className="font-mono text-foreground">WITH CHECK</span> policy, finds Mike has no
              write access, and returns error code{" "}
              <span className="font-mono">42501</span> — the actual database, not a JS simulation.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={tryWriteAsViewer}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Try a write as Mike
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface UserPickerProps {
  users: { id: string; full_name: string }[];
  value: string;
  onChange: (v: string) => void;
}

function UserPicker({ users, value, onChange }: UserPickerProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border bg-background">
      {users
        .filter((u) => PRIMARY_USER_IDS.includes(u.id))
        .map((u) => (
          <button
            key={u.id}
            onClick={() => onChange(u.id)}
            className={`px-2.5 py-1 text-xs transition-colors ${
              value === u.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {u.full_name.split(" ")[0]}
          </button>
        ))}
    </div>
  );
}
