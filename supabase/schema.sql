-- ============================================================
-- Young Lift Market — Supabase Schema
-- Run this in the Supabase SQL editor to initialize the database
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role            TEXT NOT NULL DEFAULT 'buyer'
                    CHECK (role IN ('buyer', 'creator')),
  full_name       TEXT,
  username        TEXT UNIQUE,
  avatar_url      TEXT,
  banner_url      TEXT,
  shop_name       TEXT,
  bio             TEXT,
  stripe_account_id  TEXT UNIQUE,
  stripe_onboarded   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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
-- LISTINGS
-- ────────────────────────────────────────────────────────────
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

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

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
-- ORDERS
-- ────────────────────────────────────────────────────────────
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

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "orders_select_buyer"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Creators can view orders for their listings
CREATE POLICY "orders_select_creator"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = orders.listing_id
        AND listings.creator_id = auth.uid()
    )
  );

-- Service role inserts orders (from API route)
CREATE POLICY "orders_insert_any"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Service role updates orders (from webhook)
CREATE POLICY "orders_update_any"
  ON public.orders FOR UPDATE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────

-- Run in Storage section or via Supabase dashboard:
-- 1. Create bucket "listings" (public: true)
-- 2. Create bucket "avatars" (public: true)
-- 3. Create bucket "banners" (public: true)

-- Storage policies (run after creating buckets):

INSERT INTO storage.buckets (id, name, public)
  VALUES ('listings', 'listings', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('banners', 'banners', true)
  ON CONFLICT (id) DO NOTHING;

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
-- HELPER FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Decrement listing stock safely (called from webhook)
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

-- Auto-create profile on user sign-up
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_creator_id   ON public.listings(creator_id);
CREATE INDEX IF NOT EXISTS idx_listings_category      ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_is_active     ON public.listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_created_at    ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id        ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id      ON public.orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session  ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username      ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role          ON public.profiles(role);
