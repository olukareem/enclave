import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { entities } from "@/lib/mock-data";
import { initials } from "@/lib/utils";
import type { Document, Transaction, Asset, Obligation, User } from "@/lib/types";

type AnyRow = Document | Transaction | Asset | Obligation;

interface ResultSetTableProps {
  user: User;
  rows: AnyRow[];
  totalRows: number;
}

export function ResultSetTable({ user, rows, totalRows }: ResultSetTableProps) {
  const visibleEntityIds = new Set(rows.map((r) => r.entity_id));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/20 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials(user.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium leading-tight">As {user.full_name}</div>
            <div className="text-[11px] leading-tight text-muted-foreground font-mono">
              auth.uid() = &apos;{user.id}&apos;
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold tabular-nums">{rows.length}</div>
          <div className="text-[11px] text-muted-foreground">of {totalRows} total</div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <div className="text-sm text-muted-foreground">No rows returned</div>
            <div className="max-w-xs text-[11px] text-muted-foreground">
              The RLS policy filtered every row. {user.full_name} has no entity memberships matching
              this table.
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {rows.slice(0, 8).map((row) => {
              const entity = entities.find((e) => e.id === row.entity_id);
              return (
                <li key={row.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{rowTitle(row)}</div>
                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-mono">{row.entity_id}</span>
                      {entity ? (
                        <>
                          {" "}
                          <span>·</span> {entity.name}
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
            {rows.length > 8 ? (
              <li className="px-4 py-2 text-center text-[11px] text-muted-foreground">
                … {rows.length - 8} more rows
              </li>
            ) : null}
          </ul>
        )}
      </CardContent>
      <div className="border-t bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        Visible entities:{" "}
        {visibleEntityIds.size === 0 ? (
          <span>none</span>
        ) : (
          <span className="inline-flex flex-wrap gap-1">
            {Array.from(visibleEntityIds).map((id) => {
              const e = entities.find((x) => x.id === id);
              return (
                <Badge key={id} variant="outline" className="font-normal">
                  {e?.name ?? id}
                </Badge>
              );
            })}
          </span>
        )}
      </div>
    </Card>
  );
}

function rowTitle(row: AnyRow): string {
  if ("title" in row) return row.title;
  if ("description" in row) return row.description;
  return row.name;
}
