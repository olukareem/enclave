"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient, type MockClient } from "./mock-supabase";
import { entities, users } from "./mock-data";
import { getAccessibleEntityIds, getRole } from "./rls-policies";
import type { Entity, Role, User, UUID } from "./types";

const STORAGE_KEY = "clientPortalDemo:auth";

interface PersistedState {
  userId: UUID | null;
  entityId: UUID | null;
}

interface AuthState {
  currentUser: User | null;
  currentEntity: Entity | null;
  availableEntities: Entity[];
  currentRole: Role | null;
  db: MockClient;
  loginAs: (userId: UUID) => void;
  logout: () => void;
  selectEntity: (entityId: UUID) => void;
  ready: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

function loadPersisted(): PersistedState {
  if (typeof window === "undefined") return { userId: null, entityId: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { userId: null, entityId: null };
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      userId: parsed.userId ?? null,
      entityId: parsed.entityId ?? null,
    };
  } catch {
    return { userId: null, entityId: null };
  }
}

function savePersisted(state: PersistedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<UUID | null>(null);
  const [entityId, setEntityId] = useState<UUID | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted.userId) {
      const accessible = getAccessibleEntityIds(persisted.userId);
      const validEntityId =
        persisted.entityId && accessible.has(persisted.entityId)
          ? persisted.entityId
          : accessible.values().next().value ?? null;
      setUserId(persisted.userId);
      setEntityId(validEntityId);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePersisted({ userId, entityId });
  }, [userId, entityId, ready]);

  const loginAs = useCallback((newUserId: UUID) => {
    const accessible = getAccessibleEntityIds(newUserId);
    const firstEntity = accessible.values().next().value ?? null;
    setUserId(newUserId);
    setEntityId(firstEntity);
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    setEntityId(null);
  }, []);

  const selectEntity = useCallback((newEntityId: UUID) => {
    setEntityId(newEntityId);
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u.id === userId) ?? null,
    [userId],
  );

  const availableEntities = useMemo(() => {
    if (!userId) return [];
    const accessible = getAccessibleEntityIds(userId);
    return entities.filter((e) => accessible.has(e.id));
  }, [userId]);

  const currentEntity = useMemo(
    () => availableEntities.find((e) => e.id === entityId) ?? null,
    [availableEntities, entityId],
  );

  const currentRole = useMemo(
    () => (userId && entityId ? getRole(userId, entityId) : null),
    [userId, entityId],
  );

  const db = useMemo(() => createClient(userId), [userId]);

  const value: AuthState = {
    currentUser,
    currentEntity,
    availableEntities,
    currentRole,
    db,
    loginAs,
    logout,
    selectEntity,
    ready,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
