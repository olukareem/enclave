"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function EntitySwitcher() {
  const { availableEntities, currentEntity, selectEntity } = useAuth();

  if (!availableEntities.length) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        No accessible entities
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex min-w-[14rem] items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-accent",
          )}
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-left font-medium">
            {currentEntity?.name ?? "Select entity"}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[14rem]">
        <DropdownMenuLabel>
          {availableEntities.length} accessible{" "}
          {availableEntities.length === 1 ? "entity" : "entities"}
        </DropdownMenuLabel>
        {availableEntities.map((e) => (
          <DropdownMenuItem
            key={e.id}
            onSelect={() => selectEntity(e.id)}
            className="flex items-start gap-2"
          >
            <Check
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0",
                currentEntity?.id === e.id ? "opacity-100" : "opacity-0",
              )}
            />
            <div className="flex-1">
              <div className="font-medium">{e.name}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {e.type}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
