"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  documents: "Documents",
  transactions: "Transactions",
  assets: "Assets",
  obligations: "Obligations",
  schema: "Schema viewer",
  "rls-demo": "RLS demo",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const { currentEntity } = useAuth();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
      {currentEntity ? (
        <>
          <span className="font-medium text-foreground">{currentEntity.name}</span>
          <ChevronRight className="h-3 w-3" />
        </>
      ) : null}
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = LABELS[seg] ?? seg;
        return (
          <span key={href} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
            {!isLast ? <ChevronRight className="h-3 w-3" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
