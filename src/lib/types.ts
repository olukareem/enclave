// Core types mirroring the Postgres schema we'd ship in Supabase.
// Every field name and type matches what `generate_typescript_types` would emit.

export type UUID = string;
export type ISODate = string;        // 'YYYY-MM-DD'
export type ISODateTime = string;    // ISO 8601

export type EntityType = "client" | "group" | "company";
export type Role = "admin" | "viewer" | "advisor";
export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "pending" | "completed" | "cancelled";
export type ObligationType = "loan" | "lease" | "subscription" | "other";
export type ObligationStatus = "active" | "paid" | "overdue";

export interface User {
  id: UUID;
  email: string;
  full_name: string;
  created_at: ISODateTime;
}

export interface Entity {
  id: UUID;
  name: string;
  type: EntityType;
  created_at: ISODateTime;
}

export interface UserEntity {
  id: UUID;
  user_id: UUID;
  entity_id: UUID;
  role: Role;
  created_at: ISODateTime;
}

export interface Document {
  id: UUID;
  entity_id: UUID;
  title: string;
  file_type: string;       // 'pdf' | 'xlsx' | 'docx' | 'png' | ...
  file_size: number;       // bytes
  storage_path: string;
  uploaded_by: UUID;
  created_at: ISODateTime;
}

export interface Transaction {
  id: UUID;
  entity_id: UUID;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: ISODate;
  created_at: ISODateTime;
}

export interface Asset {
  id: UUID;
  entity_id: UUID;
  name: string;
  category: string;
  value: number;
  currency: string;
  as_of_date: ISODate;
  created_at: ISODateTime;
}

export interface Obligation {
  id: UUID;
  entity_id: UUID;
  name: string;
  type: ObligationType;
  amount: number;
  due_date: ISODate;
  status: ObligationStatus;
  created_at: ISODateTime;
}

// ── Table registry ────────────────────────────────────────────────────────
// One discriminated union so `db.from('documents').select()` is fully typed.

export type TableMap = {
  users: User;
  entities: Entity;
  user_entity: UserEntity;
  documents: Document;
  transactions: Transaction;
  assets: Asset;
  obligations: Obligation;
};
export type TableName = keyof TableMap;
export type Row<T extends TableName> = TableMap[T];

// Shape used by inserts (caller doesn't supply id/created_at).
export type Insert<T extends TableName> = Omit<Row<T>, "id" | "created_at">;
