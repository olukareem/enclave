"use client";

// Entity-scoped data-fetching hook for Enclave.
//
// Replaces the previous Supabase client calls with fetches to /api/data, which
// runs queries through Neon with `SET LOCAL app.current_user_id` so Postgres
// RLS enforces access. The public hook interface is unchanged — consuming
// dashboard components require no modifications.

import { useEffect, useState } from "react";
import type { Row, TableName } from "./types";

type EntityScopedTable = "documents" | "transactions" | "assets" | "obligations";

interface QueryResult<T extends EntityScopedTable> {
  data: Row<T>[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface QueryOptions {
  // Reserved for future use — the data route uses table-specific default ordering.
  orderBy?: string;
  ascending?: boolean;
}

export function useEntityRows<T extends EntityScopedTable>(
  table: T,
  entityId: string | null,
  _opts: QueryOptions = {},
): QueryResult<T> {
  const [data, setData] = useState<Row<T>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!entityId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const url = `/api/data?table=${encodeURIComponent(table)}&entity_id=${encodeURIComponent(entityId)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ data?: Row<T>[]; error?: string }>;
      })
      .then(({ data: rows, error: apiError }) => {
        if (!active) return;
        if (apiError) {
          setError(new Error(apiError));
          setData([]);
        } else {
          setData(rows ?? []);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err);
        setData([]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [table, entityId, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}

// Generic insert helper. Calls POST /api/data and surfaces RLS violations
// (Postgres error code 42501) as a friendly Error message so the UI can
// show an appropriate toast.
export async function insertRow<T extends TableName>(
  table: T,
  row: Partial<Row<T>>,
): Promise<{ data: Row<T> | null; error: Error | null }> {
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, row }),
    });

    const json = (await res.json()) as {
      data?: Row<T>;
      error?: string;
      rls_violation?: boolean;
    };

    if (!res.ok || json.error) {
      const msg = json.rls_violation
        ? `RLS policy blocked this insert: ${json.error ?? "permission denied"}`
        : (json.error ?? `HTTP ${res.status}`);
      return { data: null, error: new Error(msg) };
    }

    return { data: json.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
