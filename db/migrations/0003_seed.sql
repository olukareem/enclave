-- Enclave — seed data (entities + transactions + assets + obligations)
-- Neon-compatible seed — no storage.buckets insert (Vercel Blob handles file storage)
--
-- Documents are seeded in 0004_demo_users.sql because documents.uploaded_by
-- references public.users, which is created in that file.
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
  ('a0000000-0000-4000-8000-000000000005', 'Torres Ventures',         'client',  '2024-03-01T09:00:00Z')
on conflict (id) do nothing;

-- ── Transactions ────────────────────────────────────────────────────────
-- date is computed relative to 2026-04-25 (NOW anchor in mock-data.ts).

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
