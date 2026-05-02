"use client";

// Auth context for Enclave — wraps Auth.js v5's useSession() in a domain-specific
// shape identical to the previous Supabase-backed implementation so all consuming
// components continue to work without changes.
//
// Public surface:
//   currentUser      — signed-in user's profile (id, email, full_name)
//   currentEntity    — the currently selected entity (persisted in localStorage)
//   availableEntities — all entities the user has membership on
//   currentRole      — the user's role for the current entity
//   ready            — true once session + memberships have loaded
//   signIn(email, password) → { error: string | null }
//   signOut()
//   selectEntity(entityId)

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession, signIn as nextSignIn, signOut as nextSignOut } from "next-auth/react";
import type { Entity, Role, UUID } from "./types";

const ENTITY_STORAGE_KEY = "enclave:selectedEntity";

export interface UserProfile {
  id: UUID;
  email: string;
  full_name: string;
}

interface Membership {
  entity: Entity;
  role: Role;
}

interface AuthState {
  currentUser: UserProfile | null;
  currentEntity: Entity | null;
  availableEntities: Entity[];
  currentRole: Role | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  selectEntity: (entityId: UUID) => void;
}

const AuthContext = createContext<AuthState | null>(null);

function readStoredEntityId(): UUID | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ENTITY_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredEntityId(id: UUID | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(ENTITY_STORAGE_KEY, id);
    else window.localStorage.removeItem(ENTITY_STORAGE_KEY);
  } catch {
    /* ignore quota errors */
  }
}

// Fetch the current user's entity memberships from the data API.
// Returns combined { entity, role } pairs. Called whenever the session changes.
async function fetchMemberships(): Promise<Membership[]> {
  try {
    const res = await fetch("/api/data?table=user_entity");
    if (!res.ok) return [];
    const { data } = await res.json() as {
      data: Array<{
        user_id: string;
        entity_id: string;
        role: Role;
        // JOIN fields from the query in /api/data
        e_id: string;
        e_name: string;
        e_type: Entity["type"];
        e_created_at: string;
      }>;
    };
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      role: row.role,
      entity: {
        id: row.e_id,
        name: row.e_name,
        type: row.e_type,
        created_at: row.e_created_at,
      },
    }));
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [entityId, setEntityId] = useState<UUID | null>(null);
  const [membershipReady, setMembershipReady] = useState(false);

  // Re-fetch memberships whenever the Auth.js session changes.
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      setMemberships([]);
      setEntityId(null);
      writeStoredEntityId(null);
      setMembershipReady(true);
      return;
    }

    setMembershipReady(false);
    fetchMemberships().then((newMemberships) => {
      setMemberships(newMemberships);

      const stored = readStoredEntityId();
      const validId =
        stored && newMemberships.some((m) => m.entity.id === stored)
          ? stored
          : newMemberships[0]?.entity.id ?? null;
      setEntityId(validId);
      writeStoredEntityId(validId);
      setMembershipReady(true);
    });
  }, [session, status]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const result = await nextSignIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) {
        return { error: result?.error ?? "Sign-in failed. Check credentials and try again." };
      }
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    writeStoredEntityId(null);
    await nextSignOut({ redirect: false });
  }, []);

  const selectEntity = useCallback((newEntityId: UUID) => {
    setEntityId(newEntityId);
    writeStoredEntityId(newEntityId);
  }, []);

  const availableEntities = useMemo(
    () => memberships.map((m) => m.entity),
    [memberships],
  );
  const currentEntity = useMemo(
    () => availableEntities.find((e) => e.id === entityId) ?? null,
    [availableEntities, entityId],
  );
  const currentRole = useMemo<Role | null>(
    () => memberships.find((m) => m.entity.id === entityId)?.role ?? null,
    [memberships, entityId],
  );

  // The user profile is derived from the Auth.js session.
  const currentUser = useMemo<UserProfile | null>(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      full_name: session.user.name ?? "",
    };
  }, [session]);

  const ready = status !== "loading" && membershipReady;

  const value: AuthState = {
    currentUser,
    currentEntity,
    availableEntities,
    currentRole,
    ready,
    signIn,
    signOut,
    selectEntity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
