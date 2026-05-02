// Tiny Supabase-shaped client backed by in-memory state.
// The real app would import { createClient } from '@supabase/supabase-js' and
// rely on Postgres RLS to filter rows. Here, applyRLS() does that filtering in
// JS — using the SAME predicate the SQL policy in rls-policies.ts encodes.

import {
  assets as seedAssets,
  documents as seedDocuments,
  entities as seedEntities,
  obligations as seedObligations,
  transactions as seedTransactions,
  userEntity as seedUserEntity,
  users as seedUsers,
} from "./mock-data";
import { applyRLS, canWrite } from "./rls-policies";
import type { Insert, Row, TableName, UUID } from "./types";

// ── Mutable in-memory store ───────────────────────────────────────────────
// Cloned once from seed data so inserts during the session don't mutate the
// imported arrays (which are module-level constants).

const store = {
  users:        [...seedUsers],
  entities:     [...seedEntities],
  user_entity:  [...seedUserEntity],
  documents:    [...seedDocuments],
  transactions: [...seedTransactions],
  assets:       [...seedAssets],
  obligations:  [...seedObligations],
} satisfies { [K in TableName]: Row<K>[] };

export function getAllRows<T extends TableName>(table: T): Row<T>[] {
  return store[table] as Row<T>[];
}

// ── RLS-aware client ──────────────────────────────────────────────────────

export class RLSViolationError extends Error {
  code = "42501"; // Postgres "insufficient_privilege" — accurate to the real error
  constructor(message: string) {
    super(message);
    this.name = "RLSViolationError";
  }
}

function matches<T extends TableName>(
  filter: Partial<Row<T>> | undefined,
): (row: Row<T>) => boolean {
  if (!filter) return () => true;
  const entries = Object.entries(filter) as [keyof Row<T>, unknown][];
  return (row) => entries.every(([k, v]) => row[k] === v);
}

interface SelectOptions<T extends TableName> {
  filter?: Partial<Row<T>>;
  orderBy?: keyof Row<T>;
  ascending?: boolean;
}

export interface MockClient {
  from: <T extends TableName>(table: T) => {
    select: (opts?: SelectOptions<T>) => Row<T>[];
    insert: (row: Insert<T>) => Row<T>;
  };
}

// `auth.uid()` equivalent. Caller passes the active user id — keeps this layer
// pure and trivially testable.
export function createClient(currentUserId: UUID | null): MockClient {
  return {
    from<T extends TableName>(table: T) {
      return {
        select(opts?: SelectOptions<T>): Row<T>[] {
          const all = getAllRows(table);
          const visible = applyRLS(table, all, currentUserId);
          let result = visible.filter(matches(opts?.filter));
          if (opts?.orderBy) {
            const key = opts.orderBy;
            const dir = opts.ascending ? 1 : -1;
            result = [...result].sort((a, b) => {
              const av = a[key], bv = b[key];
              if (av === bv) return 0;
              return av > bv ? dir : -dir;
            });
          }
          return result;
        },
        insert(row: Insert<T>): Row<T> {
          // For tables with entity_id, enforce admin role on that entity.
          // For users / entities / user_entity inserts: out of scope (would be
          // service-role only in production).
          const entityId = (row as { entity_id?: UUID }).entity_id;
          if (!entityId) {
            throw new RLSViolationError(
              `Inserts into "${table}" are restricted to service-role in this demo.`,
            );
          }
          if (!canWrite(currentUserId, entityId)) {
            throw new RLSViolationError(
              `new row for relation "${table}" violates row-level security policy ` +
              `(user lacks admin role on entity ${entityId})`,
            );
          }
          const inserted = {
            ...(row as object),
            id: `${table}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
            created_at: new Date().toISOString(),
          } as Row<T>;
          (store[table] as Row<T>[]).push(inserted);
          return inserted;
        },
      };
    },
  };
}

// Convenience for non-React call sites.
export function dbAs(userId: UUID | null) {
  return createClient(userId);
}

// Re-export the predicate so the Schema Viewer / RLS Demo pages can import the
// same function the rest of the app relies on.
export { applyRLS, canWrite } from "./rls-policies";
