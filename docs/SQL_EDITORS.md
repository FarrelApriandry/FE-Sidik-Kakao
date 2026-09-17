# SIDIK-KAKAO — Supabase SQL Schema & Seed Data

> **Target:** [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
>
> This file contains the complete PostgreSQL schema for the SIDIK-KAKAO cacao
> traceability platform. It defines custom types, relational tables, indexes,
> Row Level Security policies, a trigger for auto-profile creation, and initial
> seed data hydrated from the current mock data in `src/data/mock.ts`.

---

## Usage Guide

1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor** (left sidebar → `>_`).
3. Click **"New query"**.
4. Copy the entire SQL block below and paste it into the editor.
5. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. Verify the output shows `CREATE TYPE`, `CREATE TABLE`, `INSERT` etc. without errors.

> **Important — Seed Auth Users:** The seed section creates demo users in
> `auth.users` using `supabase_auth.admin_create_user`. This works on hosted
> Supabase projects. If you prefer, you can also create users manually via
> **Authentication → Users → Add User** in the Supabase Dashboard and then
> update the seed UUIDs accordingly.

---

## Complete SQL Script

```sql
-- ================================================================
-- SIDIK-KAKAO · Supabase Production Schema
-- Generated from: src/types, src/utils/storage, src/data/mock
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- A. CUSTOM TYPES / ENUMS
-- ────────────────────────────────────────────────────────────────

CREATE TYPE user_role      AS ENUM ('admin_poktan', 'petani');
CREATE TYPE bean_category  AS ENUM ('basah', 'fermentasi', 'kering');
CREATE TYPE cacao_grade    AS ENUM ('A', 'B');
CREATE TYPE harvest_status AS ENUM ('Terverifikasi', 'Proses Curing');

-- ────────────────────────────────────────────────────────────────
-- B. CORE RELATIONAL TABLES
-- ────────────────────────────────────────────────────────────────

-- 1. Poktan (Kelompok Tani / Farmer Group)
CREATE TABLE poktans (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    location    TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  poktans          IS 'Kelompok Tani (farmer groups)';
COMMENT ON COLUMN poktans.name     IS 'e.g. "Poktan Harapan Jaya"';
COMMENT ON COLUMN poktans.location IS 'e.g. "Sukamaju, Luwu Utara"';

-- 2. Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    poktan_id      UUID        REFERENCES poktans(id) ON DELETE SET NULL,
    full_name      TEXT        NOT NULL,
    role           user_role   NOT NULL DEFAULT 'petani',
    phone_number   TEXT,
    estate_area_ha NUMERIC(4,2),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles               IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.poktan_id     IS 'FK to the farmer group this user belongs to';
COMMENT ON COLUMN profiles.role          IS 'admin_poktan = dashboard manager, petani = field farmer';
COMMENT ON COLUMN profiles.estate_area_ha IS 'Farm area in hectares (e.g. 1.50)';

-- 3. Grade Prices (lookup / valuation matrix)
CREATE TABLE grade_prices (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    grade        cacao_grade   NOT NULL,
    category     bean_category NOT NULL,
    price_per_kg NUMERIC(12,2) NOT NULL CHECK (price_per_kg > 0),
    UNIQUE (grade, category)
);

COMMENT ON TABLE  grade_prices              IS 'Price-per-kg lookup by grade x bean category';
COMMENT ON COLUMN grade_prices.price_per_kg IS 'Indonesian Rupiah per kilogram';

-- 4. Harvest Batches (core transaction table)
CREATE TABLE harvest_batches (
    id            TEXT           PRIMARY KEY,
    farmer_id     UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    poktan_id     UUID           NOT NULL REFERENCES poktans(id)  ON DELETE CASCADE,
    weight_kg     NUMERIC(8,2)   NOT NULL CHECK (weight_kg > 0),
    category      bean_category  NOT NULL,
    grade         cacao_grade    NOT NULL,
    grade_label   TEXT,
    moisture_pct  NUMERIC(4,2),
    fungal_status TEXT           NOT NULL DEFAULT 'Bebas Jamur',
    price_per_kg  NUMERIC(12,2),
    total_value   NUMERIC(12,2),
    status        harvest_status NOT NULL DEFAULT 'Proses Curing',
    photo_url     TEXT,
    qr_payload    JSONB,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

COMMENT ON TABLE  harvest_batches               IS 'Individual harvest batch / setoran panen';
COMMENT ON COLUMN harvest_batches.id            IS 'Human-readable batch ID, e.g. BTH-KK-089';
COMMENT ON COLUMN harvest_batches.farmer_id     IS 'FK -> profiles, the farmer who submitted';
COMMENT ON COLUMN harvest_batches.poktan_id     IS 'FK -> poktans, denormalized for fast RLS';
COMMENT ON COLUMN harvest_batches.grade_label   IS 'Display label, e.g. "Grade A (SNI)"';
COMMENT ON COLUMN harvest_batches.fungal_status IS '"Bebas Jamur" or "Terdeteksi Jamur"';
COMMENT ON COLUMN harvest_batches.photo_url     IS 'Supabase Storage public URL (optional)';
COMMENT ON COLUMN harvest_batches.qr_payload    IS 'JSON payload encoded into the QR label';

-- ────────────────────────────────────────────────────────────────
-- C. INDEXES (B-Tree for query performance)
-- ────────────────────────────────────────────────────────────────

CREATE INDEX idx_hb_farmer_id  ON harvest_batches (farmer_id);
CREATE INDEX idx_hb_poktan_id  ON harvest_batches (poktan_id);
CREATE INDEX idx_hb_status     ON harvest_batches (status);
CREATE INDEX idx_hb_created_at ON harvest_batches (created_at DESC);

-- ────────────────────────────────────────────────────────────────
-- D. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE poktans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_prices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_batches ENABLE ROW LEVEL SECURITY;

-- ── poktans policies ────────────────────────────────────────────

CREATE POLICY "Authenticated users can read poktans"
    ON poktans FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage poktans"
    ON poktans FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── profiles policies ───────────────────────────────────────────

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admin poktan can read poktan profiles"
    ON profiles FOR SELECT TO authenticated
    USING (
        poktan_id IN (
            SELECT p.poktan_id FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin_poktan'
        )
    );

-- ── grade_prices policies ───────────────────────────────────────

CREATE POLICY "Authenticated users can read grade prices"
    ON grade_prices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage grade prices"
    ON grade_prices FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── harvest_batches policies ────────────────────────────────────

CREATE POLICY "Petani can read own batches"
    ON harvest_batches FOR SELECT TO authenticated
    USING (farmer_id = auth.uid());

CREATE POLICY "Petani can insert own batches"
    ON harvest_batches FOR INSERT TO authenticated
    WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Admin poktan full access to poktan batches"
    ON harvest_batches FOR ALL TO authenticated
    USING (
        poktan_id IN (
            SELECT p.poktan_id FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin_poktan'
        )
    )
    WITH CHECK (
        poktan_id IN (
            SELECT p.poktan_id FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin_poktan'
        )
    );

-- ────────────────────────────────────────────────────────────────
-- E. AUTO-CREATE PROFILE ON SIGNUP (Auth Trigger)
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(
            (NEW.raw_user_meta_data ->> 'role')::user_role,
            'petani'::user_role
        )
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- F. SEED DATA (Hydration from src/data/mock.ts)
-- ────────────────────────────────────────────────────────────────

-- F1. Poktan
INSERT INTO poktans (id, name, location) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Poktan Harapan Jaya', 'Sukamaju, Luwu Utara');

-- F2. Demo Auth Users via supabase_auth.admin_create_user
-- Admin Poktan
SELECT supabase_auth.admin_create_user(jsonb_build_object(
    'uid',           '11111111-1111-1111-1111-111111111111',
    'email',         'admin@sidikkakao.id',
    'password',      'AdminSidik2025!',
    'email_confirm', true,
    'user_metadata', jsonb_build_object(
        'full_name', 'Admin Poktan', 'role', 'admin_poktan')
));
-- Ahmad Fauzi
SELECT supabase_auth.admin_create_user(jsonb_build_object(
    'uid',           '22222222-2222-2222-2222-222222222222',
    'email',         'ahmad@sidikkakao.id',
    'password',      'PetaniSidik2025!',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('full_name', 'Ahmad Fauzi')
));
-- Joko Warsito
SELECT supabase_auth.admin_create_user(jsonb_build_object(
    'uid',           '33333333-3333-3333-3333-333333333333',
    'email',         'joko@sidikkakao.id',
    'password',      'PetaniSidik2025!',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('full_name', 'Joko Warsito')
));
-- Siti Rohmah
SELECT supabase_auth.admin_create_user(jsonb_build_object(
    'uid',           '44444444-4444-4444-4444-444444444444',
    'email',         'siti@sidikkakao.id',
    'password',      'PetaniSidik2025!',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('full_name', 'Siti Rohmah')
));
-- Budi Santoso
SELECT supabase_auth.admin_create_user(jsonb_build_object(
    'uid',           '55555555-5555-5555-5555-555555555555',
    'email',         'budi@sidikkakao.id',
    'password',      'PetaniSidik2025!',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('full_name', 'Budi Santoso')
));
-- Dewi Lestari
SELECT supabase_auth.admin_create_user(jsonb_build_object(
    'uid',           '66666666-6666-6666-6666-666666666666',
    'email',         'dewi@sidikkakao.id',
    'password',      'PetaniSidik2025!',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('full_name', 'Dewi Lestari')
));

-- F3. Profiles
INSERT INTO profiles (id, poktan_id, full_name, role, phone_number) VALUES
    ('11111111-1111-1111-1111-111111111111',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Admin Poktan', 'admin_poktan', '081234567890');

INSERT INTO profiles
    (id, poktan_id, full_name, role, phone_number, estate_area_ha)
VALUES
    ('22222222-2222-2222-2222-222222222222',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Ahmad Fauzi', 'petani', '081234567891', 1.50),
    ('33333333-3333-3333-3333-333333333333',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Joko Warsito', 'petani', '081234567892', 2.00),
    ('44444444-4444-4444-4444-444444444444',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Siti Rohmah', 'petani', '081234567893', 1.00),
    ('55555555-5555-5555-5555-555555555555',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Budi Santoso', 'petani', '081234567894', 1.75),
    ('66666666-6666-6666-6666-666666666666',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'Dewi Lestari', 'petani', '081234567895', 0.80);

-- F4. Grade Price Matrix (from MOCK_GRADE_PRICES in src/data/mock.ts)
INSERT INTO grade_prices (grade, category, price_per_kg) VALUES
    ('A', 'basah',      28000),
    ('A', 'fermentasi', 42000),
    ('A', 'kering',     55000),
    ('B', 'basah',      20000),
    ('B', 'fermentasi', 32000),
    ('B', 'kering',     40000);

-- F5. Harvest Batches (from MOCK_HARVEST_BATCHES)
-- Status logic (CatatForm.tsx): grade A -> Terverifikasi, B -> Proses Curing
INSERT INTO harvest_batches (
    id, farmer_id, poktan_id, weight_kg, category, grade, grade_label,
    moisture_pct, fungal_status, price_per_kg, total_value, status,
    qr_payload, created_at
) VALUES
    ('BTH-KK-089',
     '22222222-2222-2222-2222-222222222222',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     185.00, 'kering', 'A', 'Grade A (SNI)',
     8.50, 'Bebas Jamur', 50000.00, 9250000.00, 'Terverifikasi',
     '{"id":"BTH-KK-089","farmer":"Ahmad Fauzi","weightKg":185,"grade":"A","timestamp":"2025-10-24T15:30:00Z"}'::jsonb,
     '2025-10-24T15:30:00+08:00'),
    ('BTH-KK-088',
     '33333333-3333-3333-3333-333333333333',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     210.00, 'kering', 'A', 'Grade A (SNI)',
     7.10, 'Bebas Jamur', 50000.00, 10500000.00, 'Terverifikasi',
     '{"id":"BTH-KK-088","farmer":"Joko Warsito","weightKg":210,"grade":"A","timestamp":"2025-10-24T14:15:00Z"}'::jsonb,
     '2025-10-24T14:15:00+08:00'),
    ('BTH-KK-087',
     '44444444-4444-4444-4444-444444444444',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     95.00, 'kering', 'B', 'Grade B Fermentasi',
     10.20, 'Bebas Jamur', 48000.00, 4560000.00, 'Proses Curing',
     '{"id":"BTH-KK-087","farmer":"Siti Rohmah","weightKg":95,"grade":"B","timestamp":"2025-10-24T11:00:00Z"}'::jsonb,
     '2025-10-24T11:00:00+08:00');

-- ================================================================
-- Done! Schema + seed data are ready.
-- ================================================================
```

---

## Schema Reference

### Table Relationship Diagram

```
auth.users (Supabase built-in)
  │
  ▼ 1:1 ON DELETE CASCADE
profiles ──────────────┐
  │ role: user_role     │
  │ poktan_id ─────► poktans
  │                     │
  ▼ 1:N                  │
harvest_batches ─────────┘
  │ category: bean_category
  │ grade:    cacao_grade
  │ status:   harvest_status
  │ qr_payload: JSONB
  │
  └──► grade_prices (via grade × category lookup)
```

### Enum Values

| Enum | Values |
|---|---|
| `user_role` | `admin_poktan`, `petani` |
| `bean_category` | `basah`, `fermentasi`, `kering` |
| `cacao_grade` | `A`, `B` |
| `harvest_status` | `Terverifikasi`, `Proses Curing` |

### Seed Demo Credentials

| Email | Password | Role |
|---|---|---|
| `admin@sidikkakao.id` | `AdminSidik2025!` | `admin_poktan` |
| `ahmad@sidikkakao.id` | `PetaniSidik2025!` | `petani` |
| `joko@sidikkakao.id` | `PetaniSidik2025!` | `petani` |
| `siti@sidikkakao.id` | `PetaniSidik2025!` | `petani` |
| `budi@sidikkakao.id` | `PetaniSidik2025!` | `petani` |
| `dewi@sidikkakao.id` | `PetaniSidik2025!` | `petani` |

### RLS Policy Summary

| Table | Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| `poktans` | authenticated | ✅ all | — | — | — |
| `profiles` | authenticated (self) | ✅ own | — | ✅ own | — |
| `profiles` | admin_poktan | ✅ poktan members | — | — | — |
| `grade_prices` | authenticated | ✅ all | — | — | — |
| `harvest_batches` | petani | ✅ own | ✅ own | — | — |
| `harvest_batches` | admin_poktan | ✅ poktan | ✅ poktan | ✅ poktan | ✅ poktan |

### Indexes

| Index | Column(s) | Purpose |
|---|---|---|
| `idx_hb_farmer_id` | `farmer_id` | Petani batch lookups |
| `idx_hb_poktan_id` | `poktan_id` | Admin poktan queries |
| `idx_hb_status` | `status` | Filter by Terverifikasi / Proses Curing |
| `idx_hb_created_at` | `created_at DESC` | Chronological listing (newest first) |