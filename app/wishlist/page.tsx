'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ListingCard } from '@/components/listings/ListingCard'
import { Listing } from '@/types/database'

export default function WishlistPage() {
  const supabase = createClient()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?next=/wishlist')
        return
      }

      const { data } = await supabase
        .from('wishlists')
        .select('listing_id, listings(*, profiles(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setListings(
        (data ?? [])
          .map((w) => (w as unknown as { listing_id: string; listings: Listing | null }).listings)
          .filter((l): l is Listing => l !== null)
      )
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-8 bg-surface rounded w-40 mb-2" />
        <div className="h-4 bg-surface rounded w-24 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-divider rounded">
              <div className="aspect-square bg-surface-2" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-2 rounded w-1/3" />
                <div className="h-4 bg-surface-2 rounded w-3/4" />
                <div className="h-5 bg-surface-2 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Wishlist</h1>
        <p className="text-muted text-sm">
          {listings.length} saved item{listings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="border border-dashed border-divider rounded p-20 text-center">
          <svg
            className="w-10 h-10 text-muted/30 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-muted text-sm mb-4">No saved items yet.</p>
          <Link href="/shop" className="text-accent hover:underline text-sm font-semibold">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              wishlisted={true}
              onWishlistToggle={(newSaved) => {
                if (!newSaved) {
                  setListings((prev) => prev.filter((l) => l.id !== listing.id))
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
