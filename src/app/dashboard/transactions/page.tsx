"use client";

import { useMemo, useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type ColumnDef } from "@/components/tables/data-table";
import { useAuth } from "@/lib/auth";
import { useCanWrite } from "@/components/common/role-gate";
import { useEntityRows } from "@/lib/use-entity-query";
import { toast } from "@/lib/use-toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/types";

const TYPE_OPTIONS: ("all" | TransactionType)[] = ["all", "income", "expense", "transfer"];
const STATUS_OPTIONS: ("all" | TransactionStatus)[] = ["all", "completed", "pending", "cancelled"];

const statusVariant: Record<TransactionStatus, "success" | "warning" | "slate"> = {
  completed: "success",
  pending: "warning",
  cancelled: "slate",
};

export default function TransactionsPage() {
  const { currentEntity } = useAuth();
  const canWrite = useCanWrite();
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");

  const { data: all } = useEntityRows("transactions", currentEntity?.id ?? null, {
    orderBy: "date",
    ascending: false,
  });

  const filtered = useMemo(
    () =>
      all.filter(
        (t) =>
          (typeFilter === "all" || t.type === typeFilter) &&
          (statusFilter === "all" || t.status === statusFilter),
      ),
    [all, typeFilter, statusFilter],
  );

  const completedFiltered = filtered.filter((t) => t.status === "completed");
  const totalIncome = completedFiltered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = completedFiltered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const columns: ColumnDef<Transaction>[] = [
    {
      key: "description",
      header: "Description",
      sortAccessor: (r) => r.description.toLowerCase(),
      cell: (r) => <span className="font-medium">{r.description}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortAccessor: (r) => r.type,
      cell: (r) => <span className="capitalize text-muted-foreground">{r.type}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortAccessor: (r) => r.status,
      cell: (r) => (
        <Badge variant={statusVariant[r.status]} className="capitalize">
          {r.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      sortAccessor: (r) => r.date,
      cell: (r) => formatDate(r.date),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortAccessor: (r) => (r.type === "expense" ? -r.amount : r.amount),
      cell: (r) => (
        <span
          className={cn(
            "font-medium",
            r.type === "income" && "text-success",
            r.type === "expense" && "text-destructive",
            r.type === "transfer" && "text-muted-foreground",
          )}
        >
          {r.type === "income" ? "+" : r.type === "expense" ? "−" : ""}
          {formatCurrency(r.amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cash movements for the selected entity. Totals reflect completed transactions matching the
            current filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | TransactionType)}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t === "all" ? "All types" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | TransactionStatus)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canWrite ? (
            <Button
              onClick={() =>
                toast({
                  title: "Add transaction",
                  description: "Transaction entry coming soon.",
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button disabled>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Viewer access: read only</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 divide-y p-0 md:grid-cols-3 md:divide-x md:divide-y-0">
          <SummaryCell label="Income" value={formatCurrency(totalIncome)} tone="positive" />
          <SummaryCell label="Expense" value={formatCurrency(totalExpense)} tone="negative" />
          <SummaryCell label="Net" value={formatCurrency(totalIncome - totalExpense)} tone={totalIncome >= totalExpense ? "positive" : "negative"} />
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        emptyTitle="No transactions match your filters"
        emptyDescription="Try widening the type or status filter."
        emptyIcon={Receipt}
      />
    </div>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: string; tone: "positive" | "negative" }) {
  return (
    <div className="flex items-baseline justify-between p-5 md:flex-col md:items-start md:gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          tone === "positive" ? "text-success" : "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}
