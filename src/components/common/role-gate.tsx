"use client";

import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

interface RoleGateProps {
  allow: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { currentRole } = useAuth();
  if (currentRole && allow.includes(currentRole)) return <>{children}</>;
  return <>{fallback}</>;
}

// Convenience hook for inline checks (e.g., disabling a button instead of hiding it).
export function useCanWrite(): boolean {
  const { currentRole } = useAuth();
  return currentRole === "admin";
}
