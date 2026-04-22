-- ============================================================
-- Young Lift Market — Demo Seed Data
-- Run in the Supabase SQL Editor after running schema.sql
-- Creates 1 demo creator + 12 listings across all categories
-- ============================================================

DO $$
DECLARE
  demo_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN

  -- ── Demo creator auth user ──────────────────────────────────
  INSERT INTO auth.users (
    id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    demo_id,
    'authenticated',
    'authenticated',
    'demo@youngliftmarket.com',
    crypt('DemoPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── Demo creator profile ────────────────────────────────────
  -- Trigger may have already created the row; upsert either way
  INSERT INTO public.profiles (id, role, full_name, username, shop_name, bio, stripe_onboarded)
  VALUES (
    demo_id,
    'creator',
    'Young Lift Studio',
    'younglift',
    'Young Lift Studio',
    'Independent studio crafting limited-run handmade goods. Every piece is made with intention.',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    role            = 'creator',
    full_name       = 'Young Lift Studio',
    username        = 'younglift',
    shop_name       = 'Young Lift Studio',
    bio             = 'Independent studio crafting limited-run handmade goods. Every piece is made with intention.',
    stripe_onboarded = false;

  -- ── 12 demo listings ───────────────────────────────────────

  INSERT INTO public.listings (creator_id, title, description, price, category, images, stock, is_active)
  VALUES

  -- Jewelry (2)
  (demo_id,
   'Hammered Gold Stacking Ring',
   'Hand-forged from 14k gold-filled wire. Each ring is slightly unique due to the hammering process — no two are exactly alike. Sold individually.',
   48.00, 'Jewelry',
   ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80&auto=format&fit=crop'],
   12, true),

  (demo_id,
   'Oxidised Silver Leaf Pendant',
   'Sterling silver pendant with an intentional oxidised finish that deepens the botanical detail. Comes on a 16" chain.',
   72.00, 'Jewelry',
   ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80&auto=format&fit=crop'],
   8, true),

  -- Ceramics (2)
  (demo_id,
   'Matte White Stoneware Bowl',
   'Wheel-thrown stoneware fired to cone 10. Food-safe matte white glaze with a slight texture that makes each piece feel alive in your hands.',
   65.00, 'Ceramics',
   ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80&auto=format&fit=crop'],
   6, true),

  (demo_id,
   'Speckled Terracotta Mug',
   'Handbuilt terracotta mug with a natural speckled slip and clear food-safe glaze interior. Holds 10oz. Dishwasher safe.',
   38.00, 'Ceramics',
   ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80&auto=format&fit=crop'],
   15, true),

  -- Textiles (1)
  (demo_id,
   'Natural Cotton Macramé Wall Hanging',
   'Large-format macramé woven from undyed 5mm cotton rope. Driftwood dowel included. Approx. 24" wide × 36" long.',
   120.00, 'Textiles',
   ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop'],
   4, true),

  -- Prints & Art (2)
  (demo_id,
   'Risograph Print — "Still Life No. 3"',
   'Two-colour risograph print on 100gsm uncoated paper. Edition of 50, hand-numbered. Ships flat in a protective sleeve. A4 size.',
   35.00, 'Prints & Art',
   ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80&auto=format&fit=crop'],
   50, true),

  (demo_id,
   'Screen-Printed Botanical Poster',
   'Three-colour screen print of foraged botanicals. Printed on 270gsm cotton-feel stock. Edition of 30. 50×70cm.',
   55.00, 'Prints & Art',
   ARRAY['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80&auto=format&fit=crop'],
   30, true),

  -- Candles (1)
  (demo_id,
   'Hand-Poured Soy Candle — Cedar & Smoke',
   'Single-wick soy candle in a reusable concrete vessel. Scented with cedar, black pepper, and a hint of vetiver. 40hr burn time. 200g.',
   34.00, 'Candles',
   ARRAY['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80&auto=format&fit=crop'],
   20, true),

  -- Accessories (2)
  (demo_id,
   'Vegetable-Tanned Leather Card Holder',
   'Slim card holder cut from full-grain vegetable-tanned leather. Holds 4–6 cards. Will develop a rich patina with use.',
   42.00, 'Accessories',
   ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop'],
   18, true),

  (demo_id,
   'Waxed Canvas Tote Bag',
   'Structured tote made from 10oz waxed canvas with leather handles and a brass snap closure. Water resistant. Fits a 13" laptop.',
   98.00, 'Accessories',
   ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&auto=format&fit=crop'],
   7, true),

  -- Home Decor (1)
  (demo_id,
   'Hand-Thrown Ceramic Planter',
   'Mid-sized planter wheel-thrown in speckled stoneware with a drainage hole. Fits a 4" pot. Pairs with the tray sold separately.',
   52.00, 'Home Decor',
   ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop'],
   10, true),

  -- Clothing (1)
  (demo_id,
   'Heavyweight Organic Cotton Tee',
   '220gsm organic ring-spun cotton. Garment-dyed in a sun-faded sand tone. Relaxed boxy fit. Sizes S–XL. Made in Portugal.',
   58.00, 'Clothing',
   ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop'],
   25, true);

END $$;
