'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPriceFromDollars } from '@/lib/utils'
import { Listing } from '@/types/database'
import { ReviewSection } from '@/components/listings/ReviewSection'

export default function ListingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*, profiles(*)')
        .eq('id', id)
        .single()
      setListing(data)
      setLoading(false)
    }
    fetchListing()
  }, [id])

  const handleBuyNow = async () => {
    setBuying(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?next=/listings/${id}`)
        return
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Something went wrong')
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-surface rounded" />
          <div className="space-y-4">
            <div className="h-8 bg-surface rounded w-3/4" />
            <div className="h-10 bg-surface rounded w-1/4" />
            <div className="h-24 bg-surface rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-3xl font-black uppercase text-white mb-4">Listing Not Found</h1>
        <p className="text-muted mb-8">This item may have been removed or sold out.</p>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )
  }

  const creator = listing.profiles
  const creatorName = creator?.shop_name ?? creator?.full_name ?? 'Creator'
  const creatorUsername = creator?.username ?? creator?.id
  const images = listing.images ?? []
  const isSoldOut = listing.stock === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-xs text-muted">
          <Link href="/shop" className="hover:text-accent transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(listing.category)}`}
            className="hover:text-accent transition-colors"
          >
            {listing.category}
          </Link>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{listing.title}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-0">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-surface border border-divider rounded overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[activeImage]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-muted/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                    activeImage === i ? 'border-accent' : 'border-divider hover:border-muted'
                  }`}
                >
                  <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <Badge variant="muted" className="mb-3">
            {listing.category}
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3 leading-tight">
            {listing.title}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-accent">
              {formatPriceFromDollars(listing.price)}
            </span>
            {isSoldOut && (
              <Badge variant="default">Sold Out</Badge>
            )}
          </div>

          {listing.description && (
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  listing.stock > 5
                    ? 'bg-accent'
                    : listing.stock > 0
                    ? 'bg-yellow-400'
                    : 'bg-red-500'
                }`}
              />
              {isSoldOut
                ? 'Out of stock'
                : listing.stock <= 5
                ? `Only ${listing.stock} left`
                : 'In stock'}
            </span>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              size="lg"
              fullWidth
              onClick={handleBuyNow}
              disabled={isSoldOut || buying}
            >
              {buying ? 'Redirecting...' : isSoldOut ? 'Sold Out' : 'Buy Now'}
            </Button>
            <p className="text-xs text-muted text-center">
              Secure checkout powered by Stripe
            </p>
          </div>

          {/* Creator card */}
          {creator && (
            <div className="border border-divider rounded bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Sold by
              </p>
              <Link
                href={`/creators/${creatorUsername}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-2 flex-shrink-0 border border-divider group-hover:border-accent transition-colors">
                  {creator.avatar_url ? (
                    <Image
                      src={creator.avatar_url}
                      alt={creatorName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/10">
                      <span className="text-accent text-sm font-bold">
                        {creatorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">
                    {creatorName}
                  </p>
                  {creator.bio && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{creator.bio}</p>
                  )}
                </div>
                <span className="ml-auto text-muted text-xs group-hover:text-accent transition-colors">
                  View Shop →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <ReviewSection listingId={id} />
    </div>
  )
}
