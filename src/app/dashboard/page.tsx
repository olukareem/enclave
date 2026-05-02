"use client";

import {
  Activity,
  Building2,
  FileText,
  Package,
  Receipt,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/cards/stat-card";
import { EmptyState } from "@/components/tables/empty-state";
import { useAuth } from "@/lib/auth";
import { useEntityRows } from "@/lib/use-entity-query";
import { DEMO_NOW_ISO } from "@/lib/mock-data";
import { formatBytes, formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { currentEntity, ready } = useAuth();

  const { data: docs, loading: docsLoading } = useEntityRows(
    "documents",
    currentEntity?.id ?? null,
  );
  const { data: txns, loading: txnsLoading } = useEntityRows(
    "transactions",
    currentEntity?.id ?? null,
  );
  const { data: assets } = useEntityRows("assets", currentEntity?.id ?? null);
  const { data: obligations } = useEntityRows(
    "obligations",
    currentEntity?.id ?? null,
  );

  if (!ready) return <DashboardSkeleton />;

  if (!currentEntity) {
    return (
      <EmptyState
        icon={Building2}
        title="No entity selected"
        description="Pick an entity from the switcher in the top bar to load its data."
      />
    );
  }

  const totalAssetsValue = assets.reduce((sum, a) => sum + Number(a.value), 0);
  const activeObligations = obligations.filter((o) => o.status === "active");
  const activeObligationsTotal = activeObligations.reduce(
    (s, o) => s + Number(o.amount),
    0,
  );

  const monthAgo = new Date(DEMO_NOW_ISO).getTime() - 30 * 86_400_000;
  const txnsThisMonth = txns.filter((t) => new Date(t.created_at).getTime() >= monthAgo);
  const incomeThisMonth = txnsThisMonth
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenseThisMonth = txnsThisMonth
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);

  const recentTxns = [...txns]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5);
  const recentDocs = [...docs]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 3);

  if (docsLoading || txnsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{currentEntity.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentEntity.type === "client"
            ? "Client entity"
            : currentEntity.type === "company"
            ? "Operating company"
            : "Group"}
          {" · "}
          Overview as of {formatDate(DEMO_NOW_ISO)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Documents"
          value={docs.length.toString()}
          hint={`Most recent: ${recentDocs[0] ? formatDate(recentDocs[0].created_at) : "—"}`}
          icon={FileText}
        />
        <StatCard
          label="Total assets"
          value={formatCurrency(totalAssetsValue)}
          hint={`${assets.length} ${assets.length === 1 ? "holding" : "holdings"}`}
          icon={Wallet}
        />
        <StatCard
          label="Active obligations"
          value={activeObligations.length.toString()}
          hint={formatCurrency(activeObligationsTotal) + " outstanding"}
          icon={Package}
        />
        <StatCard
          label="Net (last 30 days)"
          value={formatCurrency(incomeThisMonth - expenseThisMonth)}
          hint={`${txnsThisMonth.length} transactions`}
          icon={Receipt}
          trend={{
            value: incomeThisMonth >= expenseThisMonth ? "Positive" : "Deficit",
            positive: incomeThisMonth >= expenseThisMonth,
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Recent transactions
            </CardTitle>
            <span className="text-xs text-muted-foreground">{recentTxns.length} of {txns.length}</span>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {recentTxns.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">No transactions yet.</div>
            ) : (
              <ul className="divide-y border-t">
                {recentTxns.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-6 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.description}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(t.date)}</span>
                        <span>·</span>
                        <Badge
                          variant={
                            t.status === "completed"
                              ? "success"
                              : t.status === "pending"
                              ? "warning"
                              : "slate"
                          }
                          className="capitalize"
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`shrink-0 text-sm font-medium tabular-nums ${
                        t.type === "income"
                          ? "text-success"
                          : t.type === "expense"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t.type === "income" ? "+" : t.type === "expense" ? "−" : "↔ "}
                      {formatCurrency(t.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent documents
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {recentDocs.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">No documents uploaded.</div>
            ) : (
              <ul className="divide-y border-t">
                {recentDocs.map((d) => (
                  <li key={d.id} className="px-6 py-3">
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="uppercase">
                        {d.file_type}
                      </Badge>
                      <span>{formatBytes(d.file_size)}</span>
                      <span>·</span>
                      <span>{formatDate(d.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
