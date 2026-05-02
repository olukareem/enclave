-- Enclave — seed data
--
-- Lifted from src/lib/mock-data.ts. Five entities and their child rows
-- (documents, transactions, assets, obligations). The user_entity rows
-- (which link auth users to entities) are created in 0004_demo_users.sql
-- after the corresponding auth.users rows exist.
--
-- All dates are anchored to 2026-04-25 so the demo looks identical regardless
-- of when it's deployed.
--
-- UUIDs are hand-picked deterministic values so 0004 can reference them.

-- ── Entities ─────────────────────────────────────────────────────────────

insert into public.entities (id, name, type, created_at) values
  ('a0000000-0000-4000-8000-000000000001', 'Acme Holdings LLC',       'client',  '2024-01-15T09:00:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Northwind Capital Group', 'company', '2024-01-22T09:00:00Z'),
  ('a0000000-0000-4000-8000-000000000003', 'Riverside Trust',         'group',   '2024-02-10T09:00:00Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Chen Family Office',      'group',   '2024-02-18T09:00:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Torres Ventures',         'client',  '2024-03-01T09:00:00Z');

-- Convenience temp table for entity ids during this transaction
do $$
declare
  acme uuid := 'a0000000-0000-4000-8000-000000000001';
  northwind uuid := 'a0000000-0000-4000-8000-000000000002';
  riverside uuid := 'a0000000-0000-4000-8000-000000000003';
  chen uuid := 'a0000000-0000-4000-8000-000000000004';
  torres uuid := 'a0000000-0000-4000-8000-000000000005';
  sarah uuid := 'b0000000-0000-4000-8000-000000000001';
  mike  uuid := 'b0000000-0000-4000-8000-000000000002';
  alex  uuid := 'b0000000-0000-4000-8000-000000000003';
  now_date date := date '2026-04-25';
begin

-- Stash these as session-scoped temp records so subsequent inserts can
-- reference them. We embed them as constants below for clarity, but having
-- the names visible up top documents the mapping.

raise notice 'Seeding for entities: acme=% northwind=% riverside=% chen=% torres=%',
  acme, northwind, riverside, chen, torres;

end $$;

-- ── Documents ────────────────────────────────────────────────────────────
-- Format: storage_path is `{entity_uuid}/doc-{slug}.{ext}` so the storage
-- bucket folder structure matches the entity FK. uploaded_by references
-- demo user UUIDs that 0004 will create.

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

-- Riverside (Alex advisor → for seed, uploaded_by = alex; admin role would normally be required for inserts, but seed bypasses RLS as it runs as service_role)
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

-- Torres (Mike viewer; uploaded_by = mike for seed history)
insert into public.documents (entity_id, title, file_type, file_size, storage_path, uploaded_by, created_at) values
  ('a0000000-0000-4000-8000-000000000005', 'Operating Agreement',             'pdf',  1120000, 'a0000000-0000-4000-8000-000000000005/operating_agreement.pdf',            'b0000000-0000-4000-8000-000000000002', '2026-01-15T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Cap Table — Series Seed',         'xlsx',   96000, 'a0000000-0000-4000-8000-000000000005/cap_table_series_seed.xlsx',         'b0000000-0000-4000-8000-000000000002', '2026-01-19T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'SAFE Agreement — Lead Investor',  'pdf',   218000, 'a0000000-0000-4000-8000-000000000005/safe_agreement_lead_investor.pdf',   'b0000000-0000-4000-8000-000000000002', '2026-01-23T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Pitch Deck v3',                   'pdf',  4600000, 'a0000000-0000-4000-8000-000000000005/pitch_deck_v3.pdf',                  'b0000000-0000-4000-8000-000000000002', '2026-01-27T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Founders Agreement',              'pdf',   412000, 'a0000000-0000-4000-8000-000000000005/founders_agreement.pdf',             'b0000000-0000-4000-8000-000000000002', '2026-01-31T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Bank Statement — March',          'pdf',    84000, 'a0000000-0000-4000-8000-000000000005/bank_statement_march.pdf',           'b0000000-0000-4000-8000-000000000002', '2026-02-04T10:30:00Z');

-- ── Transactions ────────────────────────────────────────────────────────
-- date is computed from `daysAgo` relative to 2026-04-25 (NOW anchor in mock-data.ts).

-- Acme (13 rows)
insert into public.transactions (entity_id, description, amount, type, status, date, created_at) values
  ('a0000000-0000-4000-8000-000000000001', 'Customer payment — Northbound Logistics', 142500.00, 'income',   'completed', date '2026-04-25' - 2,  date '2026-04-25' - 2),
  ('a0000000-0000-4000-8000-000000000001', 'Payroll — March 15',                       86240.00, 'expense',  'completed', date '2026-04-25' - 4,  date '2026-04-25' - 4),
  ('a0000000-0000-4000-8000-000000000001', 'Office lease — Suite 412',                 18400.00, 'expense',  'completed', date '2026-04-25' - 7,  date '2026-04-25' - 7),
  ('a0000000-0000-4000-8000-000000000001', 'Tax refund — IRS Q4 amended',              31200.00, 'income',   'completed', date '2026-04-25' - 9,  date '2026-04-25' - 9),
  ('a0000000-0000-4000-8000-000000000001', 'AWS infrastructure',                        4840.00, 'expense',  'completed', date '2026-04-25' - 11, date '2026-04-25' - 11),
  ('a0000000-0000-4000-8000-000000000001', 'Customer payment — Trillion Industries',  220000.00, 'income',   'completed', date '2026-04-25' - 14, date '2026-04-25' - 14),
  ('a0000000-0000-4000-8000-000000000001', 'Vendor — Salesforce annual',               64000.00, 'expense',  'pending',   date '2026-04-25' - 16, date '2026-04-25' - 16),
  ('a0000000-0000-4000-8000-000000000001', 'Treasury sweep — operating to reserve',   250000.00, 'transfer', 'completed', date '2026-04-25' - 18, date '2026-04-25' - 18),
  ('a0000000-0000-4000-8000-000000000001', 'Customer payment — Acme Subsidiary 03',    96400.00, 'income',   'completed', date '2026-04-25' - 22, date '2026-04-25' - 22),
  ('a0000000-0000-4000-8000-000000000001', 'Legal fees — Wilson Sonsini',              28400.00, 'expense',  'completed', date '2026-04-25' - 25, date '2026-04-25' - 25),
  ('a0000000-0000-4000-8000-000000000001', 'Insurance premium — D&O',                  14200.00, 'expense',  'completed', date '2026-04-25' - 28, date '2026-04-25' - 28),
  ('a0000000-0000-4000-8000-000000000001', 'Customer payment — Acme Retail',           48900.00, 'income',   'pending',   date '2026-04-25' - 31, date '2026-04-25' - 31),
  ('a0000000-0000-4000-8000-000000000001', 'Refund — duplicate vendor invoice',         1840.00, 'income',   'cancelled', date '2026-04-25' - 34, date '2026-04-25' - 34);

-- Northwind (10 rows)
insert into public.transactions (entity_id, description, amount, type, status, date, created_at) values
  ('a0000000-0000-4000-8000-000000000002', 'Capital call — Fund III LP',            1500000.00, 'income',   'completed', date '2026-04-25' - 5,  date '2026-04-25' - 5),
  ('a0000000-0000-4000-8000-000000000002', 'Management fee — Q1',                    480000.00, 'income',   'completed', date '2026-04-25' - 9,  date '2026-04-25' - 9),
  ('a0000000-0000-4000-8000-000000000002', 'Distribution — Fund II',                 920000.00, 'expense',  'completed', date '2026-04-25' - 12, date '2026-04-25' - 12),
  ('a0000000-0000-4000-8000-000000000002', 'Diligence — Project Echo',                38400.00, 'expense',  'completed', date '2026-04-25' - 15, date '2026-04-25' - 15),
  ('a0000000-0000-4000-8000-000000000002', 'Wire — sub-doc completion',              250000.00, 'transfer', 'completed', date '2026-04-25' - 18, date '2026-04-25' - 18),
  ('a0000000-0000-4000-8000-000000000002', 'Audit fee — KPMG',                       124000.00, 'expense',  'pending',   date '2026-04-25' - 21, date '2026-04-25' - 21),
  ('a0000000-0000-4000-8000-000000000002', 'Brokerage interest income',               18240.00, 'income',   'completed', date '2026-04-25' - 24, date '2026-04-25' - 24),
  ('a0000000-0000-4000-8000-000000000002', 'Travel — investor day',                   12400.00, 'expense',  'completed', date '2026-04-25' - 27, date '2026-04-25' - 27),
  ('a0000000-0000-4000-8000-000000000002', 'Wire — Anchor LP commitment',           2000000.00, 'income',   'completed', date '2026-04-25' - 30, date '2026-04-25' - 30),
  ('a0000000-0000-4000-8000-000000000002', 'Refund — overdrawn fee',                    240.00, 'income',   'completed', date '2026-04-25' - 33, date '2026-04-25' - 33);

-- Riverside (8 rows)
insert into public.transactions (entity_id, description, amount, type, status, date, created_at) values
  ('a0000000-0000-4000-8000-000000000003', 'Beneficiary distribution — Q1',           84000.00, 'expense',  'completed', date '2026-04-25' - 6,  date '2026-04-25' - 6),
  ('a0000000-0000-4000-8000-000000000003', 'Dividend income — equity portfolio',      28400.00, 'income',   'completed', date '2026-04-25' - 13, date '2026-04-25' - 13),
  ('a0000000-0000-4000-8000-000000000003', 'Bond coupon — muni ladder',               14280.00, 'income',   'completed', date '2026-04-25' - 19, date '2026-04-25' - 19),
  ('a0000000-0000-4000-8000-000000000003', 'Trustee compensation',                     9600.00, 'expense',  'completed', date '2026-04-25' - 22, date '2026-04-25' - 22),
  ('a0000000-0000-4000-8000-000000000003', 'Property tax — Lot 14',                   18400.00, 'expense',  'pending',   date '2026-04-25' - 26, date '2026-04-25' - 26),
  ('a0000000-0000-4000-8000-000000000003', 'Tax preparation — Schultz CPA',            6400.00, 'expense',  'completed', date '2026-04-25' - 31, date '2026-04-25' - 31),
  ('a0000000-0000-4000-8000-000000000003', 'Rebalance — to fixed income',            120000.00, 'transfer', 'completed', date '2026-04-25' - 35, date '2026-04-25' - 35),
  ('a0000000-0000-4000-8000-000000000003', 'Capital gain — partial sale',             64200.00, 'income',   'completed', date '2026-04-25' - 38, date '2026-04-25' - 38);

-- Chen (10 rows)
insert into public.transactions (entity_id, description, amount, type, status, date, created_at) values
  ('a0000000-0000-4000-8000-000000000004', 'Manager performance fee — Hedge A',       38400.00, 'expense',  'completed', date '2026-04-25' - 4,  date '2026-04-25' - 4),
  ('a0000000-0000-4000-8000-000000000004', 'Real estate rental income',               22400.00, 'income',   'completed', date '2026-04-25' - 8,  date '2026-04-25' - 8),
  ('a0000000-0000-4000-8000-000000000004', 'Family payroll — March',                  18200.00, 'expense',  'completed', date '2026-04-25' - 12, date '2026-04-25' - 12),
  ('a0000000-0000-4000-8000-000000000004', 'Sale — collectibles auction',             96000.00, 'income',   'completed', date '2026-04-25' - 16, date '2026-04-25' - 16),
  ('a0000000-0000-4000-8000-000000000004', 'Donation — family foundation',           250000.00, 'expense',  'completed', date '2026-04-25' - 20, date '2026-04-25' - 20),
  ('a0000000-0000-4000-8000-000000000004', 'Tuition — boarding school',               84000.00, 'expense',  'pending',   date '2026-04-25' - 24, date '2026-04-25' - 24),
  ('a0000000-0000-4000-8000-000000000004', 'Yacht maintenance — annual',              41200.00, 'expense',  'completed', date '2026-04-25' - 28, date '2026-04-25' - 28),
  ('a0000000-0000-4000-8000-000000000004', 'Inter-account transfer',                 500000.00, 'transfer', 'completed', date '2026-04-25' - 32, date '2026-04-25' - 32),
  ('a0000000-0000-4000-8000-000000000004', 'Dividend — Berkshire Hathaway B',         14000.00, 'income',   'completed', date '2026-04-25' - 36, date '2026-04-25' - 36),
  ('a0000000-0000-4000-8000-000000000004', 'Custodian fee',                            4600.00, 'expense',  'completed', date '2026-04-25' - 40, date '2026-04-25' - 40);

-- Torres (10 rows)
insert into public.transactions (entity_id, description, amount, type, status, date, created_at) values
  ('a0000000-0000-4000-8000-000000000005', 'Investor wire — SAFE round',             750000.00, 'income',   'completed', date '2026-04-25' - 3,  date '2026-04-25' - 3),
  ('a0000000-0000-4000-8000-000000000005', 'Payroll — engineering team',             124000.00, 'expense',  'completed', date '2026-04-25' - 6,  date '2026-04-25' - 6),
  ('a0000000-0000-4000-8000-000000000005', 'AWS + Vercel infra',                       6400.00, 'expense',  'completed', date '2026-04-25' - 9,  date '2026-04-25' - 9),
  ('a0000000-0000-4000-8000-000000000005', 'Office sublease — WeWork',                 4800.00, 'expense',  'completed', date '2026-04-25' - 13, date '2026-04-25' - 13),
  ('a0000000-0000-4000-8000-000000000005', 'Customer pilot revenue — Pilot 01',       18000.00, 'income',   'completed', date '2026-04-25' - 16, date '2026-04-25' - 16),
  ('a0000000-0000-4000-8000-000000000005', 'Legal — incorporation cleanup',            8400.00, 'expense',  'completed', date '2026-04-25' - 20, date '2026-04-25' - 20),
  ('a0000000-0000-4000-8000-000000000005', 'Founder equity buyback — vested partial', 28000.00, 'expense',  'pending',   date '2026-04-25' - 24, date '2026-04-25' - 24),
  ('a0000000-0000-4000-8000-000000000005', 'Customer payment — Pilot 02',             24000.00, 'income',   'pending',   date '2026-04-25' - 28, date '2026-04-25' - 28),
  ('a0000000-0000-4000-8000-000000000005', 'Refund — duplicate stripe charge',         1240.00, 'income',   'cancelled', date '2026-04-25' - 31, date '2026-04-25' - 31),
  ('a0000000-0000-4000-8000-000000000005', 'Software — Linear, Notion, GitHub',        2840.00, 'expense',  'completed', date '2026-04-25' - 34, date '2026-04-25' - 34);

-- ── Assets ───────────────────────────────────────────────────────────────

insert into public.assets (entity_id, name, category, value, currency, as_of_date, created_at) values
  -- Acme
  ('a0000000-0000-4000-8000-000000000001', 'Operating cash — Mercury',     'Cash',       2840000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000001', 'T-bill ladder — 4w/8w/13w',    'Treasuries', 6200000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000001', 'AR — outstanding invoices',    'Receivable', 1240000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000001', 'Office equipment',             'Fixed',       184000.00, 'USD', date '2026-04-25' - 30, date '2026-04-25' - 30),
  -- Northwind
  ('a0000000-0000-4000-8000-000000000002', 'Fund III committed capital',   'Fund',      84000000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000002', 'Fund II remaining NAV',        'Fund',      18400000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000002', 'Operating cash — JPM',         'Cash',       4120000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000002', 'GP commitment receivable',     'Receivable', 2000000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000002', 'Office build-out — NYC',       'Fixed',       412000.00, 'USD', date '2026-04-25' - 60, date '2026-04-25' - 60),
  -- Riverside
  ('a0000000-0000-4000-8000-000000000003', 'Equity portfolio — diversified', 'Equity',         4840000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000003', 'Muni bond ladder',               'Fixed Income',   2120000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000003', 'Lot 14 — Riverside property',    'Real Estate',    1650000.00, 'USD', date '2026-04-25' - 30, date '2026-04-25' - 30),
  ('a0000000-0000-4000-8000-000000000003', 'Trust cash reserve',             'Cash',            412000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  -- Chen
  ('a0000000-0000-4000-8000-000000000004', 'Hedge fund — Hedge A',           'Alternative',  12400000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000004', 'Public equity — Berkshire',      'Equity',        8200000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000004', 'Real estate — primary residence','Real Estate',  14500000.00, 'USD', date '2026-04-25' - 30, date '2026-04-25' - 30),
  ('a0000000-0000-4000-8000-000000000004', 'Real estate — vacation portfolio','Real Estate',  9800000.00, 'USD', date '2026-04-25' - 30, date '2026-04-25' - 30),
  ('a0000000-0000-4000-8000-000000000004', 'Family office cash',             'Cash',          1840000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  -- Torres
  ('a0000000-0000-4000-8000-000000000005', 'Operating cash — Brex',          'Cash',           624000.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000005', 'Stripe pending balance',         'Receivable',      18400.00, 'USD', date '2026-04-25' - 1,  date '2026-04-25' - 1),
  ('a0000000-0000-4000-8000-000000000005', 'Founder equity (cap table)',     'Equity',         412000.00, 'USD', date '2026-04-25' - 30, date '2026-04-25' - 30);

-- ── Obligations ──────────────────────────────────────────────────────────
-- due_date is NOW + dueInDays from mock-data. Negative dueInDays = past due.

insert into public.obligations (entity_id, name, type, amount, due_date, status, created_at) values
  -- Acme
  ('a0000000-0000-4000-8000-000000000001', 'Term loan — First National',           'loan',         18400.00, date '2026-04-25' + 12,  'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000001', 'Office lease — Suite 412',             'lease',        18400.00, date '2026-04-25' + 4,   'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000001', 'Salesforce — annual',                  'subscription', 64000.00, date '2026-04-25' - 45,  'paid',    date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000001', 'Contingent earn-out — acquisition',    'other',       250000.00, date '2026-04-25' + 90,  'active',  date '2026-04-25' - 60),
  -- Northwind
  ('a0000000-0000-4000-8000-000000000002', 'Office lease — NYC',                   'lease',        41200.00, date '2026-04-25' + 6,   'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000002', 'Bloomberg terminal — annual',          'subscription', 28400.00, date '2026-04-25' + 28,  'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000002', 'Audit fee — KPMG',                     'other',       124000.00, date '2026-04-25' - 3,   'overdue', date '2026-04-25' - 60),
  -- Riverside
  ('a0000000-0000-4000-8000-000000000003', 'Property tax — Lot 14',                'other',        18400.00, date '2026-04-25' + 14,  'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000003', 'Trustee compensation — quarterly',     'other',         9600.00, date '2026-04-25' + 60,  'active',  date '2026-04-25' - 60),
  -- Chen
  ('a0000000-0000-4000-8000-000000000004', 'Mortgage — primary residence',         'loan',         28400.00, date '2026-04-25' + 9,   'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000004', 'Boarding school tuition — Q2',         'other',        84000.00, date '2026-04-25' + 18,  'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000004', 'Yacht slip — Newport',                 'lease',         4800.00, date '2026-04-25' + 30,  'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000004', 'Foundation grant commitment',          'other',       250000.00, date '2026-04-25' - 20,  'paid',    date '2026-04-25' - 60),
  -- Torres
  ('a0000000-0000-4000-8000-000000000005', 'AWS — pay as you go',                  'subscription',  6400.00, date '2026-04-25' + 8,   'active',  date '2026-04-25' - 60),
  ('a0000000-0000-4000-8000-000000000005', 'WeWork — month-to-month',              'lease',         4800.00, date '2026-04-25' - 2,   'overdue', date '2026-04-25' - 60);

-- ── Storage bucket ───────────────────────────────────────────────────────
-- Create the private documents bucket. The RLS policies on storage.objects
-- in 0002_rls.sql gate access by entity membership.

insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 52428800)  -- 50 MB
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;
