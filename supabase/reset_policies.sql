-- ============================================================
-- Drop all existing RLS policies, recreate them, verify tables
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- DROP EXISTING POLICIES
-- ────────────────────────────────────────────────────────────

-- profiles
DROP POLICY IF EXISTS "profiles_select_public"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"     ON public.profiles;

-- listings
DROP POLICY IF EXISTS "listings_select_public"  ON public.listings;
DROP POLICY IF EXISTS "listings_insert_creator" ON public.listings;
DROP POLICY IF EXISTS "listings_update_own"     ON public.listings;
DROP POLICY IF EXISTS "listings_delete_own"     ON public.listings;

-- orders
DROP POLICY IF EXISTS "orders_select_buyer"     ON public.orders;
DROP POLICY IF EXISTS "orders_select_creator"   ON public.orders;
DROP POLICY IF EXISTS "orders_insert_any"       ON public.orders;
DROP POLICY IF EXISTS "orders_update_any"       ON public.orders;

-- storage
DROP POLICY IF EXISTS "listings_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "listings_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "listings_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_select"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_storage_insert"  ON storage.objects;
DROP POLICY IF EXISTS "banners_storage_select"  ON storage.objects;
DROP POLICY IF EXISTS "banners_storage_insert"  ON storage.objects;

-- ────────────────────────────────────────────────────────────
-- ENSURE TABLES EXIST (safe no-ops if already present)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role               TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'creator')),
  full_name          TEXT,
  username           TEXT UNIQUE,
  avatar_url         TEXT,
  banner_url         TEXT,
  shop_name          TEXT,
  bio                TEXT,
  stripe_account_id  TEXT UNIQUE,
  stripe_onboarded   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  category    TEXT NOT NULL,
  images      TEXT[] NOT NULL DEFAULT '{}',
  stock       INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_id         UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  amount             NUMERIC(10,2) NOT NULL,
  platform_fee       NUMERIC(10,2) NOT NULL,
  stripe_session_id  TEXT UNIQUE,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  shipping_address   JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ENABLE RLS (safe to re-run)
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- RECREATE POLICIES — PROFILES
-- ────────────────────────────────────────────────────────────

CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- RECREATE POLICIES — LISTINGS
-- ────────────────────────────────────────────────────────────

CREATE POLICY "listings_select_public"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "listings_insert_creator"
  ON public.listings FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'creator'
    )
  );

CREATE POLICY "listings_update_own"
  ON public.listings FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "listings_delete_own"
  ON public.listings FOR DELETE
  USING (auth.uid() = creator_id);

-- ────────────────────────────────────────────────────────────
-- RECREATE POLICIES — ORDERS
-- ────────────────────────────────────────────────────────────

-- Buyers see their own orders
CREATE POLICY "orders_select_buyer"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Creators see orders on their listings
CREATE POLICY "orders_select_creator"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = orders.listing_id
        AND listings.creator_id = auth.uid()
    )
  );

-- Service role inserts orders (from API route / webhook)
CREATE POLICY "orders_insert_any"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Service role updates orders (from webhook)
CREATE POLICY "orders_update_any"
  ON public.orders FOR UPDATE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (safe no-ops if already exist)
-- ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('listings', 'listings', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('banners', 'banners', true)
  ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- RECREATE POLICIES — STORAGE
-- ────────────────────────────────────────────────────────────

CREATE POLICY "listings_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

CREATE POLICY "listings_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

CREATE POLICY "listings_storage_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "banners_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "banners_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS (recreate safely)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.decrement_stock(listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.listings
  SET stock = GREATEST(stock - 1, 0)
  WHERE id = listing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- INDEXES (safe no-ops if already exist)
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_listings_creator_id  ON public.listings(creator_id);
CREATE INDEX IF NOT EXISTS idx_listings_category     ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_is_active    ON public.listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_created_at   ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id       ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id     ON public.orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username     ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role         ON public.profiles(role);

-- ────────────────────────────────────────────────────────────
-- VERIFY — run this last to confirm everything exists
-- ────────────────────────────────────────────────────────────

SELECT
  t.table_name,
  COUNT(c.column_name) AS column_count
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_name = t.table_name AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
  AND t.table_name IN ('profiles', 'listings', 'orders')
GROUP BY t.table_name
ORDER BY t.table_name;
