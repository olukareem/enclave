// Generic data query endpoint for all dashboard tables.
//
// Pattern: every request sets app.current_user_id in a Neon transaction, then
// runs the real SQL — Postgres RLS filters results using that session variable.
// The client never touches the database directly; DATABASE_URL is server-only.

import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

type Row = Record<string, unknown>;

const ENTITY_TABLES = ["documents", "transactions", "assets", "obligations"] as const;
type EntityTable = (typeof ENTITY_TABLES)[number];

function isEntityTable(t: string): t is EntityTable {
  return ENTITY_TABLES.includes(t as EntityTable);
}

// ── GET /api/data?table=X[&entity_id=Y][&ids=a,b,c] ─────────────────────────

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") ?? "";
  const entityId = searchParams.get("entity_id");
  const ids = searchParams.get("ids"); // comma-separated UUIDs for the users lookup

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (isEntityTable(table)) {
      if (!entityId) {
        return NextResponse.json({ error: "entity_id required for this table" }, { status: 400 });
      }

      // Each case uses the transaction callback form so TypeScript infers txSql's type
      // without needing a manually-typed wrapper. Both statements travel in one HTTP request.
      switch (table) {
        case "documents": {
          const [, rows] = await sql.transaction((txSql) => [
            txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
            txSql`SELECT * FROM documents WHERE entity_id = ${entityId} ORDER BY created_at DESC`,
          ]);
          return NextResponse.json({ data: rows as Row[] });
        }
        case "transactions": {
          const [, rows] = await sql.transaction((txSql) => [
            txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
            txSql`SELECT * FROM transactions WHERE entity_id = ${entityId} ORDER BY date DESC, created_at DESC`,
          ]);
          return NextResponse.json({ data: rows as Row[] });
        }
        case "assets": {
          const [, rows] = await sql.transaction((txSql) => [
            txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
            txSql`SELECT * FROM assets WHERE entity_id = ${entityId} ORDER BY value DESC, created_at DESC`,
          ]);
          return NextResponse.json({ data: rows as Row[] });
        }
        case "obligations": {
          const [, rows] = await sql.transaction((txSql) => [
            txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
            txSql`SELECT * FROM obligations WHERE entity_id = ${entityId} ORDER BY due_date ASC, created_at DESC`,
          ]);
          return NextResponse.json({ data: rows as Row[] });
        }
      }
    }

    // ── Lookup tables ────────────────────────────────────────────────────────

    switch (table) {
      case "entities": {
        const [, rows] = await sql.transaction((txSql) => [
          txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
          txSql`SELECT * FROM entities ORDER BY name ASC`,
        ]);
        return NextResponse.json({ data: rows as Row[] });
      }

      case "user_entity": {
        // Return memberships joined with entity data so auth.tsx gets everything in one request.
        const [, rows] = await sql.transaction((txSql) => [
          txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
          txSql`
            SELECT
              ue.id, ue.user_id, ue.entity_id, ue.role, ue.created_at,
              e.id         AS e_id,
              e.name       AS e_name,
              e.type       AS e_type,
              e.created_at AS e_created_at
            FROM user_entity ue
            JOIN entities e ON e.id = ue.entity_id
            WHERE ue.user_id = ${userId}
            ORDER BY e.name ASC
          `,
        ]);
        return NextResponse.json({ data: rows as Row[] });
      }

      case "users": {
        if (ids) {
          const idList = ids
            .split(",")
            .map((s) => s.trim())
            .filter((s) => /^[0-9a-f-]{36}$/i.test(s));
          if (idList.length === 0) return NextResponse.json({ data: [] });
          const [, rows] = await sql.transaction((txSql) => [
            txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
            txSql`SELECT id, email, full_name FROM users WHERE id = ANY(${idList}::uuid[])`,
          ]);
          return NextResponse.json({ data: rows as Row[] });
        }
        const [, rows] = await sql.transaction((txSql) => [
          txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
          txSql`SELECT id, email, full_name FROM users WHERE id = ${userId} LIMIT 1`,
        ]);
        return NextResponse.json({ data: rows as Row[] });
      }

      default:
        return NextResponse.json({ error: `Unknown table: ${table}` }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST /api/data { table, row } ────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { table?: string; row?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { table, row } = body;
  if (!table || !isEntityTable(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }
  if (!row || typeof row !== "object") {
    return NextResponse.json({ error: "row is required" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    switch (table) {
      case "documents": {
        const r = row as {
          entity_id: string;
          title: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
        };
        const [, rows] = await sql.transaction((txSql) => [
          txSql`SELECT set_config('app.current_user_id', ${userId}, true)`,
          txSql`
            INSERT INTO documents (entity_id, title, file_type, file_size, storage_path, uploaded_by)
            VALUES (${r.entity_id}, ${r.title}, ${r.file_type}, ${r.file_size}, ${r.storage_path}, ${r.uploaded_by})
            RETURNING *
          `,
        ]);
        return NextResponse.json({ data: (rows as Row[])[0] ?? null });
      }
      default:
        return NextResponse.json(
          { error: `Inserts not supported for table: ${table}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRls =
      (err as { code?: string }).code === "42501" ||
      msg.toLowerCase().includes("new row violates") ||
      msg.toLowerCase().includes("policy");
    return NextResponse.json(
      { error: msg, rls_violation: isRls },
      { status: isRls ? 403 : 500 },
    );
  }
}
