-- Enclave — demo users, memberships, and documents
-- Compatible with Neon Postgres (and any vanilla Postgres 14+)
--
-- Dependency order within this file:
--   1. public.users        — no FK dependencies
--   2. public.user_entity  — FK → users + entities (entities seeded in 0003)
--   3. public.documents    — FK → entities (from 0003) + users (step 1 above)
--
-- Password for all three accounts: enclave-demo
-- Run AFTER 0003_seed.sql (entities must exist for user_entity FKs).

create extension if not exists pgcrypto;

-- ── Users ────────────────────────────────────────────────────────────────

insert into public.users (id, email, full_name, password_hash) values
  (
    'b0000000-0000-4000-8000-000000000001',
    'sarah.chen@enclave.demo',
    'Sarah Chen',
    crypt('enclave-demo', gen_salt('bf', 10))
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'mike.torres@enclave.demo',
    'Mike Torres',
    crypt('enclave-demo', gen_salt('bf', 10))
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'alex.park@enclave.demo',
    'Alex Park',
    crypt('enclave-demo', gen_salt('bf', 10))
  )
on conflict (id) do nothing;

-- ── Memberships ──────────────────────────────────────────────────────────
-- Sarah (admin)   → Acme, Northwind
-- Mike  (viewer)  → Torres
-- Alex  (advisor) → Acme, Riverside, Chen

insert into public.user_entity (user_id, entity_id, role) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'admin'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 'viewer'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'advisor'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'advisor'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'advisor')
on conflict (user_id, entity_id) do nothing;

-- ── Documents ────────────────────────────────────────────────────────────
-- Inserted here (not in 0003_seed.sql) because documents.uploaded_by
-- references public.users, which is created above.
-- storage_path is `{entity_uuid}/{slug}.{ext}` matching Vercel Blob layout.

-- Acme (Sarah is admin → uploaded_by = sarah)
insert into public.documents (entity_id, title, file_type, file_size, storage_path, uploaded_by, created_at) values
  ('a0000000-0000-4000-8000-000000000001', 'Q4 2025 Financial Statement',     'pdf',  2410000, 'a0000000-0000-4000-8000-000000000001/q4_2025_financial_statement.pdf',  'b0000000-0000-4000-8000-000000000001', '2026-01-15T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000001', 'Operating Agreement (Amended)',   'pdf',  1180000, 'a0000000-0000-4000-8000-000000000001/operating_agreement_amended.pdf',  'b0000000-0000-4000-8000-000000000001', '2026-01-19T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000001', 'Vendor List 2026',                'xlsx',  184000, 'a0000000-0000-4000-8000-000000000001/vendor_list_2026.xlsx',            'b0000000-0000-4000-8000-000000000001', '2026-01-23T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000001', 'Tax Return 2024',                 'pdf',  3240000, 'a0000000-0000-4000-8000-000000000001/tax_return_2024.pdf',              'b0000000-0000-4000-8000-000000000001', '2026-01-27T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000001', 'Board Resolution March 2026',     'docx',   56000, 'a0000000-0000-4000-8000-000000000001/board_resolution_march_2026.docx', 'b0000000-0000-4000-8000-000000000001', '2026-01-31T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000001', 'Insurance Certificate',           'pdf',   412000, 'a0000000-0000-4000-8000-000000000001/insurance_certificate.pdf',        'b0000000-0000-4000-8000-000000000001', '2026-02-04T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000001', 'Audit Report 2024',               'pdf',  5120000, 'a0000000-0000-4000-8000-000000000001/audit_report_2024.pdf',            'b0000000-0000-4000-8000-000000000001', '2026-02-08T10:30:00Z');

-- Northwind (Sarah admin)
insert into public.documents (entity_id, title, file_type, file_size, storage_path, uploaded_by, created_at) values
  ('a0000000-0000-4000-8000-000000000002', 'LP Capital Call Notice',           'pdf',    84000, 'a0000000-0000-4000-8000-000000000002/lp_capital_call_notice.pdf',          'b0000000-0000-4000-8000-000000000001', '2026-01-15T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Portfolio Summary Q1 2026',        'xlsx',  318000, 'a0000000-0000-4000-8000-000000000002/portfolio_summary_q1_2026.xlsx',      'b0000000-0000-4000-8000-000000000001', '2026-01-19T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Side Letter — Anchor LP',          'pdf',   642000, 'a0000000-0000-4000-8000-000000000002/side_letter_anchor_lp.pdf',           'b0000000-0000-4000-8000-000000000001', '2026-01-23T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Subscription Agreement Template',  'docx',   92000, 'a0000000-0000-4000-8000-000000000002/subscription_agreement_template.docx', 'b0000000-0000-4000-8000-000000000001', '2026-01-27T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Form ADV 2026',                    'pdf',  1840000, 'a0000000-0000-4000-8000-000000000002/form_adv_2026.pdf',                   'b0000000-0000-4000-8000-000000000001', '2026-01-31T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Wire Confirmation 03-12',          'pdf',    18000, 'a0000000-0000-4000-8000-000000000002/wire_confirmation_03_12.pdf',         'b0000000-0000-4000-8000-000000000001', '2026-02-04T10:30:00Z');

-- Riverside (Alex advisor)
insert into public.documents (entity_id, title, file_type, file_size, storage_path, uploaded_by, created_at) values
  ('a0000000-0000-4000-8000-000000000003', 'Trust Indenture',                  'pdf',  2960000, 'a0000000-0000-4000-8000-000000000003/trust_indenture.pdf',                 'b0000000-0000-4000-8000-000000000003', '2026-01-15T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000003', 'Beneficiary Distribution Plan',    'xlsx',  142000, 'a0000000-0000-4000-8000-000000000003/beneficiary_distribution_plan.xlsx', 'b0000000-0000-4000-8000-000000000003', '2026-01-19T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000003', 'Trustee Meeting Minutes — Feb',    'docx',   41000, 'a0000000-0000-4000-8000-000000000003/trustee_meeting_minutes_feb.docx',   'b0000000-0000-4000-8000-000000000003', '2026-01-23T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000003', 'Property Appraisal — Lot 14',      'pdf',  4800000, 'a0000000-0000-4000-8000-000000000003/property_appraisal_lot_14.pdf',      'b0000000-0000-4000-8000-000000000003', '2026-01-27T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000003', 'Trust Tax K-1 2024',               'pdf',   218000, 'a0000000-0000-4000-8000-000000000003/trust_tax_k_1_2024.pdf',              'b0000000-0000-4000-8000-000000000003', '2026-01-31T10:30:00Z');

-- Chen (Alex advisor)
insert into public.documents (entity_id, title, file_type, file_size, storage_path, uploaded_by, created_at) values
  ('a0000000-0000-4000-8000-000000000004', 'Family Office IPS',               'pdf',  1640000, 'a0000000-0000-4000-8000-000000000004/family_office_ips.pdf',              'b0000000-0000-4000-8000-000000000003', '2026-01-15T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Estate Plan Summary',             'pdf',   980000, 'a0000000-0000-4000-8000-000000000004/estate_plan_summary.pdf',            'b0000000-0000-4000-8000-000000000003', '2026-01-19T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Manager Performance Review',      'xlsx',  412000, 'a0000000-0000-4000-8000-000000000004/manager_performance_review.xlsx',    'b0000000-0000-4000-8000-000000000003', '2026-01-23T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Family Constitution Draft',       'docx',  128000, 'a0000000-0000-4000-8000-000000000004/family_constitution_draft.docx',     'b0000000-0000-4000-8000-000000000003', '2026-01-27T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Generation-Skipping Trust Memo',  'pdf',   612000, 'a0000000-0000-4000-8000-000000000004/generation_skipping_trust_memo.pdf', 'b0000000-0000-4000-8000-000000000003', '2026-01-31T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Real Estate Holdings Map',        'png',  3240000, 'a0000000-0000-4000-8000-000000000004/real_estate_holdings_map.png',       'b0000000-0000-4000-8000-000000000003', '2026-02-04T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Annual Family Letter 2025',       'docx',   84000, 'a0000000-0000-4000-8000-000000000004/annual_family_letter_2025.docx',     'b0000000-0000-4000-8000-000000000003', '2026-02-08T10:30:00Z');

-- Torres (Mike viewer)
insert into public.documents (entity_id, title, file_type, file_size, storage_path, uploaded_by, created_at) values
  ('a0000000-0000-4000-8000-000000000005', 'Operating Agreement',             'pdf',  1120000, 'a0000000-0000-4000-8000-000000000005/operating_agreement.pdf',            'b0000000-0000-4000-8000-000000000002', '2026-01-15T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Cap Table — Series Seed',         'xlsx',   96000, 'a0000000-0000-4000-8000-000000000005/cap_table_series_seed.xlsx',         'b0000000-0000-4000-8000-000000000002', '2026-01-19T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'SAFE Agreement — Lead Investor',  'pdf',   218000, 'a0000000-0000-4000-8000-000000000005/safe_agreement_lead_investor.pdf',   'b0000000-0000-4000-8000-000000000002', '2026-01-23T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Pitch Deck v3',                   'pdf',  4600000, 'a0000000-0000-4000-8000-000000000005/pitch_deck_v3.pdf',                  'b0000000-0000-4000-8000-000000000002', '2026-01-27T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Founders Agreement',              'pdf',   412000, 'a0000000-0000-4000-8000-000000000005/founders_agreement.pdf',             'b0000000-0000-4000-8000-000000000002', '2026-01-31T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Bank Statement — March',          'pdf',    84000, 'a0000000-0000-4000-8000-000000000005/bank_statement_march.pdf',           'b0000000-0000-4000-8000-000000000002', '2026-02-04T10:30:00Z');

-- ── Verification ─────────────────────────────────────────────────────────

do $$
declare
  user_count int;
  entity_count int;
  membership_count int;
  doc_count int;
begin
  select count(*) into user_count from public.users;
  select count(*) into entity_count from public.entities;
  select count(*) into membership_count from public.user_entity;
  select count(*) into doc_count from public.documents;
  raise notice 'Enclave seeded: % users, % entities, % memberships, % documents',
    user_count, entity_count, membership_count, doc_count;
  if user_count <> 3 or entity_count <> 5 or membership_count <> 6 then
    raise warning 'Counts do not match expected (3 users / 5 entities / 6 memberships).';
  end if;
end $$;
