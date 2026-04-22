'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ListingCard } from '@/components/listings/ListingCard'
import { CreatorCard } from '@/components/creators/CreatorCard'
import { Button } from '@/components/ui/Button'
import { Listing, Profile, CATEGORIES } from '@/types/database'

export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const view = searchParams.get('view')
  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''

  const [listings, setListings] = useState<Listing[]>([])
  const [creators, setCreators] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  const isCreatorView = view === 'creators'

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, profiles(*)')
      .eq('is_active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)
    if (priceMin) query = query.gte('price', parseFloat(priceMin))
    if (priceMax) query = query.lte('price', parseFloat(priceMax))

    const { data } = await query
    setListings(data ?? [])
    setLoading(false)
  }, [category, search, priceMin, priceMax])

  const fetchCreators = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'creator')
      .order('created_at', { ascending: false })

    if (search) query = query.ilike('shop_name', `%${search}%`)

    const { data } = await query
    setCreators(data ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => {
    if (isCreatorView) {
      fetchCreators()
    } else {
      fetchListings()
    }
  }, [isCreatorView, fetchListings, fetchCreators])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput) {
      params.set('q', searchInput)
    } else {
      params.delete('q')
    }
    router.push(`/shop?${params.toString()}`)
  }

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">
          {isCreatorView ? 'All Creators' : 'All Listings'}
        </h1>
        <p className="text-muted text-sm">
          {isCreatorView
            ? 'Browse independent creators and their unique handmade shops'
            : 'Handcrafted goods from independent creators worldwide'}
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setParam('view', '')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
            !isCreatorView
              ? 'bg-accent text-black border-accent'
              : 'text-muted border-divider hover:text-white hover:border-muted'
          }`}
        >
          Listings
        </button>
        <button
          onClick={() => setParam('view', 'creators')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
            isCreatorView
              ? 'bg-accent text-black border-accent'
              : 'text-muted border-divider hover:text-white hover:border-muted'
          }`}
        >
          Creators
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="flex-1 min-w-0 px-3 py-2 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-accent text-black text-xs font-bold rounded hover:bg-accent/90 transition-colors"
              >
                Go
              </button>
            </div>
          </form>

          {!isCreatorView && (
            <>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Category
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setParam('category', '')}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${
                      !category ? 'text-accent bg-accent/10' : 'text-muted hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setParam('category', cat)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${
                        category === cat
                          ? 'text-accent bg-accent/10'
                          : 'text-muted hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Price Range
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    onBlur={fetchListings}
                    className="w-full px-3 py-2 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
                    min={0}
                  />
                  <span className="text-muted text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    onBlur={fetchListings}
                    className="w-full px-3 py-2 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
                    min={0}
                  />
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-divider rounded animate-pulse">
                  <div className="aspect-square bg-surface-2" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-surface-2 rounded w-1/3" />
                    <div className="h-4 bg-surface-2 rounded w-3/4" />
                    <div className="h-5 bg-surface-2 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isCreatorView ? (
            creators.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {creators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            ) : (
              <div className="border border-divider rounded bg-surface p-16 text-center">
                <p className="text-muted text-sm">No creators found.</p>
              </div>
            )
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="border border-divider rounded bg-surface p-16 text-center">
              <p className="text-muted text-sm mb-4">No listings found.</p>
              <Button variant="ghost" size="sm" onClick={() => router.push('/shop')}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
