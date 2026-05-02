"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  FileText,
  Home,
  LogOut,
  Package,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { initials, cn } from "@/lib/utils";
import { RoleBadge } from "./role-badge";

const NAV = [
  { href: "/dashboard",               label: "Overview",     icon: Home },
  { href: "/dashboard/documents",     label: "Documents",    icon: FileText },
  { href: "/dashboard/transactions",  label: "Transactions", icon: Receipt },
  { href: "/dashboard/assets",        label: "Assets",       icon: Wallet },
  { href: "/dashboard/obligations",   label: "Obligations",  icon: Package },
] as const;

const ARCHITECTURE = [
  { href: "/dashboard/schema",   label: "Schema viewer", icon: Database },
  { href: "/dashboard/rls-demo", label: "RLS demo",      icon: ShieldCheck },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, currentRole, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
        <div className="grid h-7 w-7 grid-cols-2 gap-[2px]">
          <div className="rounded-[2px] bg-primary" />
          <div className="rounded-[2px] bg-white/15" />
          <div className="rounded-[2px] bg-white/15" />
          <div className="rounded-[2px] bg-primary/55" />
        </div>
        <span className="text-sm font-semibold tracking-tight">enclave</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <SidebarSection label="Workspace" items={NAV} pathname={pathname} />
        <Separator className="my-3 bg-white/5" />
        <SidebarSection label="Under the hood" items={ARCHITECTURE} pathname={pathname} />
      </nav>

      <div className="border-t border-white/5 p-3">
        {currentUser ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/10 text-xs text-sidebar-foreground">
                {initials(currentUser.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{currentUser.full_name}</div>
              <div className="mt-0.5">
                <RoleBadge role={currentRole} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void signOut()}
              className="h-8 w-8 text-sidebar-foreground hover:bg-white/10 hover:text-white"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function SidebarSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: readonly { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </div>
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-white/10 text-white"
                : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
