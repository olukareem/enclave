import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { policies } from "@/lib/rls-policies";
import type { TableName } from "@/lib/types";

export function PolicyExplainer({ table }: { table: TableName }) {
  const p = policies[table];
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-base">{p.table}</CardTitle>
          <Badge variant="outline">RLS policy</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            What this means
          </div>
          <p className="mt-1 text-sm leading-relaxed">{p.english}</p>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            JS implementation (this app)
          </div>
          <pre className="mt-1 overflow-x-auto rounded-md bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
            {p.jsImpl}
          </pre>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Postgres SELECT policy
          </div>
          <pre className="mt-1 overflow-x-auto rounded-md border bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
            {p.selectSQL}
          </pre>
        </div>

        {p.insertSQL ? (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Postgres INSERT policy (admin only)
            </div>
            <pre className="mt-1 overflow-x-auto rounded-md border bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
              {p.insertSQL}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
