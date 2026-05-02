"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { EntitySwitcher } from "./entity-switcher";
import { RoleBadge } from "./role-badge";

export function Topbar() {
  const { currentUser, currentRole } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      <EntitySwitcher />

      {currentUser ? (
        <div className="flex items-center gap-2.5 border-l pl-4">
          <RoleBadge role={currentRole} />
          <div className="text-right">
            <div className="text-xs font-medium leading-tight">{currentUser.full_name}</div>
            <div className="text-[11px] leading-tight text-muted-foreground">{currentUser.email}</div>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials(currentUser.full_name)}</AvatarFallback>
          </Avatar>
        </div>
      ) : null}
    </header>
  );
}
