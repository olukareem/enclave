// Static layout for the Schema Viewer.
// Coordinates and column metadata live here so schema-canvas.tsx stays purely
// presentational. Coordinates are in the SVG's user-space (1080 x 760).

import type { TableName } from "@/lib/types";

export interface ColumnMeta {
  name: string;
  type: string;
  pk?: boolean;
  fk?: { table: TableName; column: string };
  rls?: boolean; // marks the column the RLS policy keys on
}

export interface TableMeta {
  name: TableName;
  label: string;
  description: string;
  x: number;
  y: number;
  width: number;
  highlight?: boolean;
  columns: ColumnMeta[];
}

export const TABLE_WIDTH = 220;

// Layout — 3 rows:
//   Top row    : users, user_entity (centered, highlighted), entities
//   Middle row : documents, transactions
//   Bottom row : assets, obligations
//
// All entity-scoped tables sit below `user_entity` so the FK arrows visually
// converge on the access-control core.
export const TABLES: TableMeta[] = [
  {
    name: "users",
    label: "users",
    description: "Email + bcrypt hash. Authenticated via Auth.js v5.",
    x: 60,
    y: 30,
    width: TABLE_WIDTH,
    columns: [
      { name: "id",         type: "uuid",        pk: true },
      { name: "email",      type: "text" },
      { name: "full_name",  type: "text" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "user_entity",
    label: "user_entity",
    description: "Access control core.",
    x: 430,
    y: 30,
    width: TABLE_WIDTH,
    highlight: true,
    columns: [
      { name: "id",         type: "uuid",        pk: true },
      { name: "user_id",    type: "uuid",        fk: { table: "users", column: "id" }, rls: true },
      { name: "entity_id",  type: "uuid",        fk: { table: "entities", column: "id" }, rls: true },
      { name: "role",       type: "enum" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "entities",
    label: "entities",
    description: "Tenant boundary.",
    x: 800,
    y: 30,
    width: TABLE_WIDTH,
    columns: [
      { name: "id",         type: "uuid",        pk: true },
      { name: "name",       type: "text" },
      { name: "type",       type: "enum" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "documents",
    label: "documents",
    description: "Files in storage.",
    x: 60,
    y: 320,
    width: TABLE_WIDTH,
    columns: [
      { name: "id",            type: "uuid",        pk: true },
      { name: "entity_id",     type: "uuid",        fk: { table: "entities", column: "id" }, rls: true },
      { name: "title",         type: "text" },
      { name: "file_type",     type: "text" },
      { name: "file_size",     type: "bigint" },
      { name: "storage_path",  type: "text" },
      { name: "uploaded_by",   type: "uuid",        fk: { table: "users", column: "id" } },
      { name: "created_at",    type: "timestamptz" },
    ],
  },
  {
    name: "transactions",
    label: "transactions",
    description: "Cash movements.",
    x: 320,
    y: 320,
    width: TABLE_WIDTH,
    columns: [
      { name: "id",          type: "uuid",        pk: true },
      { name: "entity_id",   type: "uuid",        fk: { table: "entities", column: "id" }, rls: true },
      { name: "description", type: "text" },
      { name: "amount",      type: "numeric" },
      { name: "type",        type: "enum" },
      { name: "status",      type: "enum" },
      { name: "date",        type: "date" },
      { name: "created_at",  type: "timestamptz" },
    ],
  },
  {
    name: "assets",
    label: "assets",
    description: "Holdings & valuations.",
    x: 580,
    y: 320,
    width: TABLE_WIDTH,
    columns: [
      { name: "id",          type: "uuid",        pk: true },
      { name: "entity_id",   type: "uuid",        fk: { table: "entities", column: "id" }, rls: true },
      { name: "name",        type: "text" },
      { name: "category",    type: "text" },
      { name: "value",       type: "numeric" },
      { name: "currency",    type: "text" },
      { name: "as_of_date",  type: "date" },
      { name: "created_at",  type: "timestamptz" },
    ],
  },
  {
    name: "obligations",
    label: "obligations",
    description: "Liabilities.",
    x: 840,
    y: 320,
    width: TABLE_WIDTH,
    columns: [
      { name: "id",          type: "uuid",        pk: true },
      { name: "entity_id",   type: "uuid",        fk: { table: "entities", column: "id" }, rls: true },
      { name: "name",        type: "text" },
      { name: "type",        type: "enum" },
      { name: "amount",      type: "numeric" },
      { name: "due_date",    type: "date" },
      { name: "status",      type: "enum" },
      { name: "created_at",  type: "timestamptz" },
    ],
  },
];

// Header (~38px) + 24px per column.
const HEADER_HEIGHT = 50;
const ROW_HEIGHT = 24;
export function tableHeight(t: TableMeta): number {
  return HEADER_HEIGHT + t.columns.length * ROW_HEIGHT + 12;
}

// Column anchor — y-coord of the centerline for a given column inside a table.
export function columnAnchorY(t: TableMeta, columnName: string): number {
  const idx = t.columns.findIndex((c) => c.name === columnName);
  if (idx === -1) return t.y + HEADER_HEIGHT / 2;
  return t.y + HEADER_HEIGHT + idx * ROW_HEIGHT + ROW_HEIGHT / 2;
}

export interface FkLink {
  fromTable: TableName;
  fromColumn: string;
  toTable: TableName;
  toColumn: string;
}

export const FK_LINKS: FkLink[] = TABLES.flatMap((t) =>
  t.columns
    .filter((c) => c.fk)
    .map((c) => ({
      fromTable: t.name,
      fromColumn: c.name,
      toTable: c.fk!.table,
      toColumn: c.fk!.column,
    })),
);

export const SVG_WIDTH = 1080;
export const SVG_HEIGHT = 760;
