// Deterministic seed data. No Math.random — values are hand-picked so the demo
// looks identical on every page load and on every machine.

import type {
  Asset,
  Document,
  Entity,
  Obligation,
  Transaction,
  User,
  UserEntity,
} from "./types";

// ── Users ─────────────────────────────────────────────────────────────────
export const SARAH_ID = "u-sarah-chen";
export const MIKE_ID = "u-mike-torres";
export const ALEX_ID = "u-alex-park";

export const users: User[] = [
  {
    id: SARAH_ID,
    email: "sarah.chen@example.com",
    full_name: "Sarah Chen",
    created_at: "2024-01-12T09:00:00Z",
  },
  {
    id: MIKE_ID,
    email: "mike.torres@example.com",
    full_name: "Mike Torres",
    created_at: "2024-02-03T09:00:00Z",
  },
  {
    id: ALEX_ID,
    email: "alex.park@example.com",
    full_name: "Alex Park",
    created_at: "2024-02-20T09:00:00Z",
  },
];

// ── Entities ──────────────────────────────────────────────────────────────
export const ACME_ID = "e-acme";
export const NORTHWIND_ID = "e-northwind";
export const RIVERSIDE_ID = "e-riverside";
export const CHEN_ID = "e-chen-family";
export const TORRES_ID = "e-torres-ventures";

export const entities: Entity[] = [
  { id: ACME_ID,      name: "Acme Holdings LLC",        type: "client",  created_at: "2024-01-15T09:00:00Z" },
  { id: NORTHWIND_ID, name: "Northwind Capital Group",  type: "company", created_at: "2024-01-22T09:00:00Z" },
  { id: RIVERSIDE_ID, name: "Riverside Trust",          type: "group",   created_at: "2024-02-10T09:00:00Z" },
  { id: CHEN_ID,      name: "Chen Family Office",       type: "group",   created_at: "2024-02-18T09:00:00Z" },
  { id: TORRES_ID,    name: "Torres Ventures",          type: "client",  created_at: "2024-03-01T09:00:00Z" },
];

// ── User ↔ Entity (the access-control core) ───────────────────────────────
export const userEntity: UserEntity[] = [
  { id: "ue-1", user_id: SARAH_ID, entity_id: ACME_ID,      role: "admin",   created_at: "2024-01-15T09:00:00Z" },
  { id: "ue-2", user_id: SARAH_ID, entity_id: NORTHWIND_ID, role: "admin",   created_at: "2024-01-22T09:00:00Z" },
  { id: "ue-3", user_id: MIKE_ID,  entity_id: TORRES_ID,    role: "viewer",  created_at: "2024-03-01T09:00:00Z" },
  { id: "ue-4", user_id: ALEX_ID,  entity_id: ACME_ID,      role: "advisor", created_at: "2024-02-25T09:00:00Z" },
  { id: "ue-5", user_id: ALEX_ID,  entity_id: RIVERSIDE_ID, role: "advisor", created_at: "2024-02-25T09:00:00Z" },
  { id: "ue-6", user_id: ALEX_ID,  entity_id: CHEN_ID,      role: "advisor", created_at: "2024-02-25T09:00:00Z" },
];

// ── Documents (per entity) ────────────────────────────────────────────────
const docTemplates: Record<string, { title: string; file_type: string; size: number }[]> = {
  [ACME_ID]: [
    { title: "Q4 2025 Financial Statement",  file_type: "pdf",  size: 2_410_000 },
    { title: "Operating Agreement (Amended)", file_type: "pdf",  size: 1_180_000 },
    { title: "Vendor List 2026",              file_type: "xlsx", size: 184_000 },
    { title: "Tax Return 2024",               file_type: "pdf",  size: 3_240_000 },
    { title: "Board Resolution March 2026",   file_type: "docx", size: 56_000 },
    { title: "Insurance Certificate",         file_type: "pdf",  size: 412_000 },
    { title: "Audit Report 2024",             file_type: "pdf",  size: 5_120_000 },
  ],
  [NORTHWIND_ID]: [
    { title: "LP Capital Call Notice",         file_type: "pdf",  size: 84_000 },
    { title: "Portfolio Summary Q1 2026",      file_type: "xlsx", size: 318_000 },
    { title: "Side Letter — Anchor LP",        file_type: "pdf",  size: 642_000 },
    { title: "Subscription Agreement Template", file_type: "docx", size: 92_000 },
    { title: "Form ADV 2026",                  file_type: "pdf",  size: 1_840_000 },
    { title: "Wire Confirmation 03-12",        file_type: "pdf",  size: 18_000 },
  ],
  [RIVERSIDE_ID]: [
    { title: "Trust Indenture",                file_type: "pdf",  size: 2_960_000 },
    { title: "Beneficiary Distribution Plan",  file_type: "xlsx", size: 142_000 },
    { title: "Trustee Meeting Minutes — Feb",  file_type: "docx", size: 41_000 },
    { title: "Property Appraisal — Lot 14",    file_type: "pdf",  size: 4_800_000 },
    { title: "Trust Tax K-1 2024",             file_type: "pdf",  size: 218_000 },
  ],
  [CHEN_ID]: [
    { title: "Family Office IPS",              file_type: "pdf",  size: 1_640_000 },
    { title: "Estate Plan Summary",            file_type: "pdf",  size: 980_000 },
    { title: "Manager Performance Review",     file_type: "xlsx", size: 412_000 },
    { title: "Family Constitution Draft",      file_type: "docx", size: 128_000 },
    { title: "Generation-Skipping Trust Memo", file_type: "pdf",  size: 612_000 },
    { title: "Real Estate Holdings Map",       file_type: "png",  size: 3_240_000 },
    { title: "Annual Family Letter 2025",      file_type: "docx", size: 84_000 },
  ],
  [TORRES_ID]: [
    { title: "Operating Agreement",            file_type: "pdf",  size: 1_120_000 },
    { title: "Cap Table — Series Seed",        file_type: "xlsx", size: 96_000 },
    { title: "SAFE Agreement — Lead Investor", file_type: "pdf",  size: 218_000 },
    { title: "Pitch Deck v3",                  file_type: "pdf",  size: 4_600_000 },
    { title: "Founders Agreement",             file_type: "pdf",  size: 412_000 },
    { title: "Bank Statement — March",         file_type: "pdf",  size: 84_000 },
  ],
};

const adminUploaderFor: Record<string, string> = {
  [ACME_ID]: SARAH_ID,
  [NORTHWIND_ID]: SARAH_ID,
  [RIVERSIDE_ID]: ALEX_ID,
  [CHEN_ID]: ALEX_ID,
  [TORRES_ID]: MIKE_ID,
};

export const documents: Document[] = Object.entries(docTemplates).flatMap(
  ([entityId, list]) =>
    list.map((d, i) => ({
      id: `doc-${entityId}-${i + 1}`,
      entity_id: entityId,
      title: d.title,
      file_type: d.file_type,
      file_size: d.size,
      storage_path: `/${entityId}/${d.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${d.file_type}`,
      uploaded_by: adminUploaderFor[entityId],
      created_at: new Date(2026, 0, 15 + i * 4, 10, 30).toISOString(),
    })),
);

// ── Transactions ──────────────────────────────────────────────────────────
type TxnSeed = { description: string; amount: number; type: "income" | "expense" | "transfer"; status: "pending" | "completed" | "cancelled"; daysAgo: number };

const txnTemplates: Record<string, TxnSeed[]> = {
  [ACME_ID]: [
    { description: "Customer payment — Northbound Logistics",  amount: 142_500, type: "income",   status: "completed", daysAgo: 2 },
    { description: "Payroll — March 15",                       amount: 86_240,  type: "expense",  status: "completed", daysAgo: 4 },
    { description: "Office lease — Suite 412",                 amount: 18_400,  type: "expense",  status: "completed", daysAgo: 7 },
    { description: "Tax refund — IRS Q4 amended",              amount: 31_200,  type: "income",   status: "completed", daysAgo: 9 },
    { description: "AWS infrastructure",                       amount: 4_840,   type: "expense",  status: "completed", daysAgo: 11 },
    { description: "Customer payment — Trillion Industries",   amount: 220_000, type: "income",   status: "completed", daysAgo: 14 },
    { description: "Vendor — Salesforce annual",               amount: 64_000,  type: "expense",  status: "pending",   daysAgo: 16 },
    { description: "Treasury sweep — operating to reserve",    amount: 250_000, type: "transfer", status: "completed", daysAgo: 18 },
    { description: "Customer payment — Acme Subsidiary 03",    amount: 96_400,  type: "income",   status: "completed", daysAgo: 22 },
    { description: "Legal fees — Wilson Sonsini",              amount: 28_400,  type: "expense",  status: "completed", daysAgo: 25 },
    { description: "Insurance premium — D&O",                  amount: 14_200,  type: "expense",  status: "completed", daysAgo: 28 },
    { description: "Customer payment — Acme Retail",           amount: 48_900,  type: "income",   status: "pending",   daysAgo: 31 },
    { description: "Refund — duplicate vendor invoice",        amount: 1_840,   type: "income",   status: "cancelled", daysAgo: 34 },
  ],
  [NORTHWIND_ID]: [
    { description: "Capital call — Fund III LP",               amount: 1_500_000, type: "income",   status: "completed", daysAgo: 5 },
    { description: "Management fee — Q1",                      amount: 480_000,   type: "income",   status: "completed", daysAgo: 9 },
    { description: "Distribution — Fund II",                   amount: 920_000,   type: "expense",  status: "completed", daysAgo: 12 },
    { description: "Diligence — Project Echo",                 amount: 38_400,    type: "expense",  status: "completed", daysAgo: 15 },
    { description: "Wire — sub-doc completion",                amount: 250_000,   type: "transfer", status: "completed", daysAgo: 18 },
    { description: "Audit fee — KPMG",                         amount: 124_000,   type: "expense",  status: "pending",   daysAgo: 21 },
    { description: "Brokerage interest income",                amount: 18_240,    type: "income",   status: "completed", daysAgo: 24 },
    { description: "Travel — investor day",                    amount: 12_400,    type: "expense",  status: "completed", daysAgo: 27 },
    { description: "Wire — Anchor LP commitment",              amount: 2_000_000, type: "income",   status: "completed", daysAgo: 30 },
    { description: "Refund — overdrawn fee",                   amount: 240,       type: "income",   status: "completed", daysAgo: 33 },
  ],
  [RIVERSIDE_ID]: [
    { description: "Beneficiary distribution — Q1",            amount: 84_000,  type: "expense",  status: "completed", daysAgo: 6 },
    { description: "Dividend income — equity portfolio",       amount: 28_400,  type: "income",   status: "completed", daysAgo: 13 },
    { description: "Bond coupon — muni ladder",                amount: 14_280,  type: "income",   status: "completed", daysAgo: 19 },
    { description: "Trustee compensation",                     amount: 9_600,   type: "expense",  status: "completed", daysAgo: 22 },
    { description: "Property tax — Lot 14",                    amount: 18_400,  type: "expense",  status: "pending",   daysAgo: 26 },
    { description: "Tax preparation — Schultz CPA",            amount: 6_400,   type: "expense",  status: "completed", daysAgo: 31 },
    { description: "Rebalance — to fixed income",              amount: 120_000, type: "transfer", status: "completed", daysAgo: 35 },
    { description: "Capital gain — partial sale",              amount: 64_200,  type: "income",   status: "completed", daysAgo: 38 },
  ],
  [CHEN_ID]: [
    { description: "Manager performance fee — Hedge A",        amount: 38_400,  type: "expense",  status: "completed", daysAgo: 4 },
    { description: "Real estate rental income",                amount: 22_400,  type: "income",   status: "completed", daysAgo: 8 },
    { description: "Family payroll — March",                   amount: 18_200,  type: "expense",  status: "completed", daysAgo: 12 },
    { description: "Sale — collectibles auction",              amount: 96_000,  type: "income",   status: "completed", daysAgo: 16 },
    { description: "Donation — family foundation",             amount: 250_000, type: "expense",  status: "completed", daysAgo: 20 },
    { description: "Tuition — boarding school",                amount: 84_000,  type: "expense",  status: "pending",   daysAgo: 24 },
    { description: "Yacht maintenance — annual",               amount: 41_200,  type: "expense",  status: "completed", daysAgo: 28 },
    { description: "Inter-account transfer",                   amount: 500_000, type: "transfer", status: "completed", daysAgo: 32 },
    { description: "Dividend — Berkshire Hathaway B",          amount: 14_000,  type: "income",   status: "completed", daysAgo: 36 },
    { description: "Custodian fee",                            amount: 4_600,   type: "expense",  status: "completed", daysAgo: 40 },
  ],
  [TORRES_ID]: [
    { description: "Investor wire — SAFE round",               amount: 750_000, type: "income",   status: "completed", daysAgo: 3 },
    { description: "Payroll — engineering team",               amount: 124_000, type: "expense",  status: "completed", daysAgo: 6 },
    { description: "AWS + Vercel infra",                       amount: 6_400,   type: "expense",  status: "completed", daysAgo: 9 },
    { description: "Office sublease — WeWork",                 amount: 4_800,   type: "expense",  status: "completed", daysAgo: 13 },
    { description: "Customer pilot revenue — Pilot 01",        amount: 18_000,  type: "income",   status: "completed", daysAgo: 16 },
    { description: "Legal — incorporation cleanup",            amount: 8_400,   type: "expense",  status: "completed", daysAgo: 20 },
    { description: "Founder equity buyback — vested partial",  amount: 28_000,  type: "expense",  status: "pending",   daysAgo: 24 },
    { description: "Customer payment — Pilot 02",              amount: 24_000,  type: "income",   status: "pending",   daysAgo: 28 },
    { description: "Refund — duplicate stripe charge",         amount: 1_240,   type: "income",   status: "cancelled", daysAgo: 31 },
    { description: "Software — Linear, Notion, GitHub",        amount: 2_840,   type: "expense",  status: "completed", daysAgo: 34 },
  ],
};

// "Now" anchor for relative dates so the demo is deterministic regardless of clock.
const NOW = new Date("2026-04-25T12:00:00Z").getTime();
function isoDateNDaysAgo(daysAgo: number): string {
  const d = new Date(NOW - daysAgo * 86_400_000);
  return d.toISOString().slice(0, 10);
}
function isoDateTimeNDaysAgo(daysAgo: number): string {
  return new Date(NOW - daysAgo * 86_400_000).toISOString();
}

export const transactions: Transaction[] = Object.entries(txnTemplates).flatMap(
  ([entityId, list]) =>
    list.map((t, i) => ({
      id: `txn-${entityId}-${i + 1}`,
      entity_id: entityId,
      description: t.description,
      amount: t.amount,
      type: t.type,
      status: t.status,
      date: isoDateNDaysAgo(t.daysAgo),
      created_at: isoDateTimeNDaysAgo(t.daysAgo),
    })),
);

// ── Assets ────────────────────────────────────────────────────────────────
const assetTemplates: Record<string, { name: string; category: string; value: number; daysAgo: number }[]> = {
  [ACME_ID]: [
    { name: "Operating cash — Mercury",     category: "Cash",       value: 2_840_000, daysAgo: 1 },
    { name: "T-bill ladder — 4w/8w/13w",    category: "Treasuries", value: 6_200_000, daysAgo: 1 },
    { name: "AR — outstanding invoices",    category: "Receivable", value: 1_240_000, daysAgo: 1 },
    { name: "Office equipment",             category: "Fixed",      value: 184_000,   daysAgo: 30 },
  ],
  [NORTHWIND_ID]: [
    { name: "Fund III committed capital",   category: "Fund",       value: 84_000_000, daysAgo: 1 },
    { name: "Fund II remaining NAV",        category: "Fund",       value: 18_400_000, daysAgo: 1 },
    { name: "Operating cash — JPM",         category: "Cash",       value: 4_120_000,  daysAgo: 1 },
    { name: "GP commitment receivable",     category: "Receivable", value: 2_000_000,  daysAgo: 1 },
    { name: "Office build-out — NYC",       category: "Fixed",      value: 412_000,    daysAgo: 60 },
  ],
  [RIVERSIDE_ID]: [
    { name: "Equity portfolio — diversified", category: "Equity",   value: 4_840_000, daysAgo: 1 },
    { name: "Muni bond ladder",              category: "Fixed Income", value: 2_120_000, daysAgo: 1 },
    { name: "Lot 14 — Riverside property",   category: "Real Estate",  value: 1_650_000, daysAgo: 30 },
    { name: "Trust cash reserve",            category: "Cash",       value: 412_000,   daysAgo: 1 },
  ],
  [CHEN_ID]: [
    { name: "Hedge fund — Hedge A",          category: "Alternative", value: 12_400_000, daysAgo: 1 },
    { name: "Public equity — Berkshire",     category: "Equity",      value: 8_200_000,  daysAgo: 1 },
    { name: "Real estate — primary residence", category: "Real Estate", value: 14_500_000, daysAgo: 30 },
    { name: "Real estate — vacation portfolio", category: "Real Estate", value: 9_800_000, daysAgo: 30 },
    { name: "Family office cash",            category: "Cash",        value: 1_840_000,  daysAgo: 1 },
  ],
  [TORRES_ID]: [
    { name: "Operating cash — Brex",         category: "Cash",       value: 624_000, daysAgo: 1 },
    { name: "Stripe pending balance",        category: "Receivable", value: 18_400,  daysAgo: 1 },
    { name: "Founder equity (cap table)",    category: "Equity",     value: 412_000, daysAgo: 30 },
  ],
};

export const assets: Asset[] = Object.entries(assetTemplates).flatMap(
  ([entityId, list]) =>
    list.map((a, i) => ({
      id: `ast-${entityId}-${i + 1}`,
      entity_id: entityId,
      name: a.name,
      category: a.category,
      value: a.value,
      currency: "USD",
      as_of_date: isoDateNDaysAgo(a.daysAgo),
      created_at: isoDateTimeNDaysAgo(a.daysAgo),
    })),
);

// ── Obligations ───────────────────────────────────────────────────────────
const obligationTemplates: Record<string, { name: string; type: "loan" | "lease" | "subscription" | "other"; amount: number; status: "active" | "paid" | "overdue"; dueInDays: number }[]> = {
  [ACME_ID]: [
    { name: "Term loan — First National",         type: "loan",         amount: 18_400, status: "active",  dueInDays: 12 },
    { name: "Office lease — Suite 412",            type: "lease",        amount: 18_400, status: "active",  dueInDays: 4 },
    { name: "Salesforce — annual",                 type: "subscription", amount: 64_000, status: "paid",    dueInDays: -45 },
    { name: "Contingent earn-out — acquisition",   type: "other",        amount: 250_000, status: "active", dueInDays: 90 },
  ],
  [NORTHWIND_ID]: [
    { name: "Office lease — NYC",                  type: "lease",        amount: 41_200,  status: "active",  dueInDays: 6 },
    { name: "Bloomberg terminal — annual",         type: "subscription", amount: 28_400,  status: "active",  dueInDays: 28 },
    { name: "Audit fee — KPMG",                    type: "other",        amount: 124_000, status: "overdue", dueInDays: -3 },
  ],
  [RIVERSIDE_ID]: [
    { name: "Property tax — Lot 14",               type: "other",        amount: 18_400, status: "active", dueInDays: 14 },
    { name: "Trustee compensation — quarterly",    type: "other",        amount: 9_600,  status: "active", dueInDays: 60 },
  ],
  [CHEN_ID]: [
    { name: "Mortgage — primary residence",        type: "loan",         amount: 28_400, status: "active",  dueInDays: 9 },
    { name: "Boarding school tuition — Q2",        type: "other",        amount: 84_000, status: "active",  dueInDays: 18 },
    { name: "Yacht slip — Newport",                type: "lease",        amount: 4_800,  status: "active",  dueInDays: 30 },
    { name: "Foundation grant commitment",         type: "other",        amount: 250_000, status: "paid",   dueInDays: -20 },
  ],
  [TORRES_ID]: [
    { name: "AWS — pay as you go",                 type: "subscription", amount: 6_400, status: "active",  dueInDays: 8 },
    { name: "WeWork — month-to-month",             type: "lease",        amount: 4_800, status: "overdue", dueInDays: -2 },
  ],
};

export const obligations: Obligation[] = Object.entries(obligationTemplates).flatMap(
  ([entityId, list]) =>
    list.map((o, i) => ({
      id: `obl-${entityId}-${i + 1}`,
      entity_id: entityId,
      name: o.name,
      type: o.type,
      amount: o.amount,
      due_date: isoDateNDaysAgo(-o.dueInDays),
      status: o.status,
      created_at: isoDateTimeNDaysAgo(60),
    })),
);

// ── Demo "now" — exported so date-sensitive components can render
// deterministically (e.g. "in 4 days" instead of drifting with real clock). ─
export const DEMO_NOW_ISO = new Date(NOW).toISOString();
