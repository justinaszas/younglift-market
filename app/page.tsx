import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/ListingCard'
import { CreatorCard } from '@/components/creators/CreatorCard'
import { Button } from '@/components/ui/Button'
import { Listing, Profile, CATEGORIES } from '@/types/database'

export const revalidate = 60

async function getFeaturedCreators(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'creator')
    .not('shop_name', 'is', null)
    .limit(8)
  return data ?? []
}

async function getLatestListings(): Promise<Listing[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('is_active', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

export default async function HomePage() {
  const [creators, listings] = await Promise.all([getFeaturedCreators(), getLatestListings()])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-divider">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-xs font-semibold uppercase tracking-widest">
                Handmade. Rare. Yours.
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tight text-white mb-6">
              Where Craft
              <br />
              <span className="text-accent">Meets</span>
              <br />
              Culture.
            </h1>

            <p className="text-lg text-muted leading-relaxed mb-10 max-w-xl">
              Discover unique handmade goods from independent creators. Every piece tells a story.
              Every purchase supports an artist.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg">Shop Creators</Button>
              </Link>
              <Link href="/auth/register?role=creator">
                <Button size="lg" variant="ghost">
                  Become a Creator
                </Button>
              </Link>
            </div>

            <div className="flex gap-8 mt-12">
              {[
                { label: 'Creators', value: creators.length > 0 ? `${creators.length}+` : '—' },
                { label: 'Handmade items', value: listings.length > 0 ? `${listings.length}+` : '—' },
                { label: 'Creator earnings', value: '90%' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-accent">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-muted mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative grid */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none hidden lg:block">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,255,178,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,178,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </section>

      {/* Categories Strip */}
      <section className="border-b border-divider overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 min-w-max">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-3 px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent hover:bg-surface-2 transition-all border-r border-divider whitespace-nowrap"
              >
                <span className="w-1 h-1 rounded-full bg-current" />
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      {creators.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
                Featured
              </p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Meet the Creators
              </h2>
            </div>
            <Link
              href="/shop?view=creators"
              className="text-xs font-bold uppercase tracking-wider text-muted hover:text-accent transition-colors hidden sm:block"
            >
              View All →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
              Just Dropped
            </p>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Latest Listings
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-muted hover:text-accent transition-colors hidden sm:block"
          >
            Browse All →
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="border border-divider rounded bg-surface p-16 text-center">
            <p className="text-muted text-sm mb-4">No listings yet. Be the first creator.</p>
            <Link href="/auth/register?role=creator">
              <Button variant="ghost">Start Selling</Button>
            </Link>
          </div>
        )}

        {listings.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/shop">
              <Button variant="outline" size="lg">
                View All Listings
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Creator CTA Banner */}
      <section className="border-t border-divider bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border border-accent/20 rounded bg-accent/5 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3">
                Sell Your Craft.
                <br />
                <span className="text-accent">Keep 90%.</span>
              </h2>
              <p className="text-muted text-sm max-w-sm">
                Join our growing community of independent creators. Set up your shop in minutes,
                list your work, and get paid directly.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link href="/auth/register?role=creator">
                <Button size="lg" fullWidth>
                  Open Your Shop
                </Button>
              </Link>
              <p className="text-xs text-muted text-center">
                No monthly fees. 10% platform fee only on sales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
