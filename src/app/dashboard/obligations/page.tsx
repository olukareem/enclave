"use client";

import { Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type ColumnDef } from "@/components/tables/data-table";
import { useAuth } from "@/lib/auth";
import { useCanWrite } from "@/components/common/role-gate";
import { useEntityRows } from "@/lib/use-entity-query";
import { DEMO_NOW_ISO } from "@/lib/mock-data";
import { toast } from "@/lib/use-toast";
import { cn, formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import type { Obligation, ObligationStatus } from "@/lib/types";

const statusVariant: Record<ObligationStatus, "default" | "success" | "destructive"> = {
  active: "default",
  paid: "success",
  overdue: "destructive",
};

export default function ObligationsPage() {
  const { currentEntity } = useAuth();
  const canWrite = useCanWrite();

  const { data: obligations } = useEntityRows("obligations", currentEntity?.id ?? null, {
    orderBy: "due_date",
    ascending: true,
  });
  const activeTotal = obligations
    .filter((o) => o.status === "active" || o.status === "overdue")
    .reduce((s, o) => s + Number(o.amount), 0);

  const columns: ColumnDef<Obligation>[] = [
    {
      key: "name",
      header: "Name",
      sortAccessor: (r) => r.name.toLowerCase(),
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortAccessor: (r) => r.type,
      cell: (r) => <span className="capitalize text-muted-foreground">{r.type}</span>,
    },
    {
      key: "due_date",
      header: "Due",
      sortAccessor: (r) => r.due_date,
      cell: (r) => {
        const rel = formatRelativeDate(r.due_date, DEMO_NOW_ISO);
        const isOverdue = r.status === "overdue";
        return (
          <div className="flex flex-col">
            <span>{formatDate(r.due_date)}</span>
            <span
              className={cn(
                "text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {rel}
            </span>
          </div>
        );
      },
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
      key: "amount",
      header: "Amount",
      align: "right",
      sortAccessor: (r) => r.amount,
      cell: (r) => formatCurrency(r.amount),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Obligations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Loans, leases, subscriptions, and other liabilities. Total active{" "}
            <span className="font-medium text-foreground tabular-nums">{formatCurrency(activeTotal)}</span>.
          </p>
        </div>

        {canWrite ? (
          <Button onClick={() => toast({ title: "Add obligation", description: "Form not wired in this demo." })}>
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

      <DataTable
        columns={columns}
        rows={obligations}
        rowKey={(r) => r.id}
        emptyTitle="No obligations recorded"
        emptyDescription="Add a loan, lease, or subscription to start tracking."
        emptyIcon={Package}
      />
    </div>
  );
}
