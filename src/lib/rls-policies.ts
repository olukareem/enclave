// Three representations of the same access rule, deliberately co-located.
//
//   1. The actual Postgres policy SQL — same as in db/migrations/0002_rls.sql.
//   2. A plain-English description ("what this policy means").
//   3. A JS predicate function used by lib/mock-supabase.ts.
//
// Anyone reviewing this file can verify that all three encode the same logic.
// That's the point: the Schema Viewer and RLS Demo pages render (1) and (2),
// and the rest of the app enforces (3) — they cannot drift apart silently.

import type { Row, TableName, UUID } from "./types";
import { userEntity } from "./mock-data";

// Returns the set of entity_ids the given user can access.
// SQL equivalent:  SELECT entity_id FROM user_entity WHERE user_id = current_setting('app.current_user_id', true)::uuid;
export function getAccessibleEntityIds(userId: UUID | null): Set<UUID> {
  if (!userId) return new Set();
  return new Set(
    userEntity.filter((ue) => ue.user_id === userId).map((ue) => ue.entity_id),
  );
}

// Returns the role for (user, entity), or null if no membership exists.
// SQL equivalent:  SELECT role FROM user_entity
//                  WHERE user_id = current_setting('app.current_user_id', true)::uuid AND entity_id = $entityId;
export function getRole(userId: UUID | null, entityId: UUID): "admin" | "viewer" | "advisor" | null {
  if (!userId) return null;
  const ue = userEntity.find(
    (x) => x.user_id === userId && x.entity_id === entityId,
  );
  return ue ? ue.role : null;
}

// JS implementation of the SELECT policy: filter by accessible entity_ids.
// Tables `users` and `entities` get a different rule (see below).
export function applyRLS<T extends TableName>(
  table: T,
  rows: readonly Row<T>[],
  userId: UUID | null,
): Row<T>[] {
  if (!userId) return [];
  if (table === "users") {
    // A user can only see their own row.
    return (rows as readonly Row<"users">[]).filter((r) => r.id === userId) as Row<T>[];
  }
  if (table === "entities") {
    const accessible = getAccessibleEntityIds(userId);
    return (rows as readonly Row<"entities">[]).filter((r) =>
      accessible.has(r.id),
    ) as Row<T>[];
  }
  if (table === "user_entity") {
    // Users can see their own membership rows.
    return (rows as readonly Row<"user_entity">[]).filter(
      (r) => r.user_id === userId,
    ) as Row<T>[];
  }
  // documents | transactions | assets | obligations — entity-scoped.
  const accessible = getAccessibleEntityIds(userId);
  return (rows as readonly { entity_id: UUID }[]).filter((r) =>
    accessible.has(r.entity_id),
  ) as Row<T>[];
}

// Role gate for writes. Admins can write everywhere they have access.
// Viewers and advisors are read-only in this demo.
export function canWrite(userId: UUID | null, entityId: UUID): boolean {
  return getRole(userId, entityId) === "admin";
}

// ── Policy bundle: SQL + English + JS function name (for display) ─────────

export interface PolicyDoc {
  table: TableName;
  english: string;
  selectSQL: string;
  insertSQL?: string;
  jsImpl: string; // points reader at the predicate above
}

export const policies: Record<TableName, PolicyDoc> = {
  users: {
    table: "users",
    english:
      "Users can SELECT only their own row. The session variable app.current_user_id (set by the API before each query) must match the row's id column.",
    selectSQL: `CREATE POLICY "users_self" ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);`,
    jsImpl: "applyRLS('users', rows, userId)  →  rows.filter(r => r.id === userId)",
  },
  entities: {
    table: "entities",
    english:
      "Users can SELECT only entities they belong to via user_entity. Inserts are restricted to service-role.",
    selectSQL: `CREATE POLICY "entities_member_visible" ON entities
  FOR SELECT
  USING (
    id IN (SELECT entity_id FROM user_entity WHERE user_id = current_setting('app.current_user_id', true)::uuid)
  );`,
    jsImpl: "applyRLS('entities', rows, userId)  →  rows.filter(r => accessible.has(r.id))",
  },
  user_entity: {
    table: "user_entity",
    english:
      "Users can SELECT only their own membership rows. Inserts/updates are restricted to admins of the target entity.",
    selectSQL: `CREATE POLICY "user_entity_self" ON user_entity
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);`,
    insertSQL: `CREATE POLICY "user_entity_admin_writes" ON user_entity
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_entity me
      WHERE me.user_id = current_setting('app.current_user_id', true)::uuid
        AND me.entity_id = user_entity.entity_id
        AND me.role = 'admin'
    )
  );`,
    jsImpl: "applyRLS('user_entity', rows, userId)  →  rows.filter(r => r.user_id === userId)",
  },
  documents: {
    table: "documents",
    english:
      "Users can SELECT documents only when the row's entity_id matches an entity they belong to via user_entity. Inserts require an admin role on the target entity.",
    selectSQL: `CREATE POLICY "entity_isolation" ON documents
  FOR SELECT
  USING (
    entity_id IN (
      SELECT entity_id FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );`,
    insertSQL: `CREATE POLICY "admin_writes" ON documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND entity_id = documents.entity_id
        AND role = 'admin'
    )
  );`,
    jsImpl: "applyRLS('documents', rows, userId)  →  rows.filter(r => accessible.has(r.entity_id))",
  },
  transactions: {
    table: "transactions",
    english:
      "Same entity-isolation rule as documents. SELECT requires entity membership; INSERT requires admin role.",
    selectSQL: `CREATE POLICY "entity_isolation" ON transactions
  FOR SELECT
  USING (
    entity_id IN (
      SELECT entity_id FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );`,
    insertSQL: `CREATE POLICY "admin_writes" ON transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND entity_id = transactions.entity_id
        AND role = 'admin'
    )
  );`,
    jsImpl: "applyRLS('transactions', rows, userId)  →  rows.filter(r => accessible.has(r.entity_id))",
  },
  assets: {
    table: "assets",
    english:
      "Same entity-isolation rule. SELECT requires entity membership; INSERT/UPDATE require admin role.",
    selectSQL: `CREATE POLICY "entity_isolation" ON assets
  FOR SELECT
  USING (
    entity_id IN (
      SELECT entity_id FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );`,
    insertSQL: `CREATE POLICY "admin_writes" ON assets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND entity_id = assets.entity_id
        AND role = 'admin'
    )
  );`,
    jsImpl: "applyRLS('assets', rows, userId)  →  rows.filter(r => accessible.has(r.entity_id))",
  },
  obligations: {
    table: "obligations",
    english:
      "Same entity-isolation rule. SELECT requires entity membership; INSERT/UPDATE require admin role.",
    selectSQL: `CREATE POLICY "entity_isolation" ON obligations
  FOR SELECT
  USING (
    entity_id IN (
      SELECT entity_id FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );`,
    insertSQL: `CREATE POLICY "admin_writes" ON obligations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_entity
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
        AND entity_id = obligations.entity_id
        AND role = 'admin'
    )
  );`,
    jsImpl: "applyRLS('obligations', rows, userId)  →  rows.filter(r => accessible.has(r.entity_id))",
  },
};

// Tables whose UI-facing list pages enforce per-user filtering.
export const RLS_DEMO_TABLES = [
  "documents",
  "transactions",
  "assets",
  "obligations",
] as const;
export type RlsDemoTable = (typeof RLS_DEMO_TABLES)[number];
