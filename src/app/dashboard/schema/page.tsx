"use client";

import { useState } from "react";
import { Database, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SchemaCanvas } from "@/components/schema/schema-canvas";
import { PolicyExplainer } from "@/components/schema/policy-explainer";
import type { TableName } from "@/lib/types";

export default function SchemaPage() {
  const [selected, setSelected] = useState<TableName>("user_entity");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Schema viewer</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Seven tables, six foreign keys, one access-control core. Every entity-scoped table joins
          back to <span className="font-mono text-foreground">user_entity</span> through{" "}
          <span className="font-mono text-foreground">entity_id</span>, which is what RLS keys on.
          Click a table to see its policy in plain English and SQL.
        </p>
      </div>

      <Card className="bg-muted/20">
        <CardContent className="grid grid-cols-1 gap-3 p-4 text-xs sm:grid-cols-3">
          <Legend
            icon={KeyRound}
            label="Star (★)"
            description="Primary key column"
          />
          <Legend
            icon={Database}
            label="Arrow (→)"
            description="Foreign key reference; hover an arrow to highlight"
          />
          <Legend
            icon={ShieldCheck}
            label="Blue dot"
            description="Column the RLS policy keys on"
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <SchemaCanvas selected={selected} onSelect={setSelected} />
        <PolicyExplainer table={selected} />
      </div>
    </div>
  );
}

function Legend({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div>
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
