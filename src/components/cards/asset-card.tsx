import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Asset } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary">{asset.category}</Badge>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {asset.currency}
          </span>
        </div>
        <div className="text-sm font-medium leading-tight">{asset.name}</div>
        <div className="text-xl font-semibold tabular-nums">{formatCurrency(asset.value)}</div>
        <div className="text-xs text-muted-foreground">As of {formatDate(asset.as_of_date)}</div>
      </CardContent>
    </Card>
  );
}
