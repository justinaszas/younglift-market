import Image from 'next/image'
import Link from 'next/link'
import { Listing } from '@/types/database'
import { formatPriceFromDollars } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Stars } from '@/components/ui/Stars'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.images?.[0] ?? null
  const creatorName = listing.profiles?.shop_name ?? listing.profiles?.full_name ?? 'Creator'
  const avatarUrl = listing.profiles?.avatar_url ?? null

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-surface border border-divider rounded card-hover overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          {image ? (
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-muted/30"
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
          {listing.stock === 0 && (
            <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-muted">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <Badge variant="muted" className="mb-2">
            {listing.category}
          </Badge>
          <h3 className="text-sm font-semibold text-white leading-tight mb-1 line-clamp-2 group-hover:text-accent transition-colors">
            {listing.title}
          </h3>
          <p className="text-accent font-bold text-base mb-1.5">
            {formatPriceFromDollars(listing.price)}
          </p>

          {listing.avg_rating != null && !!listing.review_count && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Stars rating={listing.avg_rating} size="sm" />
              <span className="text-xs text-muted">({listing.review_count})</span>
            </div>
          )}

          {listing.profiles && (
            <div className="flex items-center gap-2 pt-2 border-t border-divider">
              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-surface-2 flex-shrink-0">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={creatorName} fill className="object-cover" sizes="20px" />
                ) : (
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent text-[8px] font-bold">
                      {creatorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted truncate">{creatorName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
