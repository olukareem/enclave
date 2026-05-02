import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/types";

const roleStyles: Record<Role, { label: string; variant: "default" | "success" | "warning" | "slate" }> = {
  admin:   { label: "Admin",   variant: "default" },
  viewer:  { label: "Viewer",  variant: "slate" },
  advisor: { label: "Advisor", variant: "warning" },
};

export function RoleBadge({ role }: { role: Role | null }) {
  if (!role) return null;
  const style = roleStyles[role];
  return <Badge variant={style.variant}>{style.label}</Badge>;
}
