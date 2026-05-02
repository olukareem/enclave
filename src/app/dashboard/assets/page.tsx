"use client";

import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AssetCard } from "@/components/cards/asset-card";
import { EmptyState } from "@/components/tables/empty-state";
import { useAuth } from "@/lib/auth";
import { useCanWrite } from "@/components/common/role-gate";
import { useEntityRows } from "@/lib/use-entity-query";
import { toast } from "@/lib/use-toast";
import { formatCurrency } from "@/lib/utils";

export default function AssetsPage() {
  const { currentEntity } = useAuth();
  const canWrite = useCanWrite();

  const { data: assets } = useEntityRows("assets", currentEntity?.id ?? null);
  const total = assets.reduce((s, a) => s + Number(a.value), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Holdings tracked for this entity. Total portfolio value below.
          </p>
        </div>

        {canWrite ? (
          <Button
            onClick={() =>
              toast({ title: "Add asset", description: "Form not wired in this demo." })
            }
          >
            <Plus className="h-4 w-4" />
            Add asset
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button disabled>
                  <Plus className="h-4 w-4" />
                  Add asset
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Viewer access: read only</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total portfolio value
        </div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">{formatCurrency(total)}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {assets.length} {assets.length === 1 ? "holding" : "holdings"}
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No assets recorded"
          description="Add the entity's first asset to start tracking portfolio value."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      )}
    </div>
  );
}
