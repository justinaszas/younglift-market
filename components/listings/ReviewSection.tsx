'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Stars } from '@/components/ui/Stars'
import { Review } from '@/types/database'

const STAR_PATH =
  'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'

export function ReviewSection({ listingId }: { listingId: string }) {
  const supabase = createClient()

  const [reviews, setReviews] = useState<Review[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('reviews')
          .select('*, profiles(full_name, username, avatar_url)')
          .eq('listing_id', listingId)
          .order('created_at', { ascending: false }),
      ])
      const rows = (data ?? []) as Review[]
      setUserId(user?.id ?? null)
      setReviews(rows)
      if (user) setHasReviewed(rows.some((r) => r.buyer_id === user.id))
    }
    load()
  }, [listingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSubmitting(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('reviews')
      .insert({ listing_id: listingId, buyer_id: userId, rating, comment: comment.trim() || null })
      .select('*, profiles(full_name, username, avatar_url)')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setReviews((prev) => [data as Review, ...prev])
    setHasReviewed(true)
    setComment('')
    setRating(5)
    setSubmitting(false)
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <div className="mt-16 border-t border-divider pt-12">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-4 mb-8">
        <h2 className="text-xl font-black uppercase tracking-tight">Reviews</h2>
        {avgRating !== null ? (
          <div className="flex items-center gap-2">
            <Stars rating={avgRating} />
            <span className="text-sm text-muted">
              {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted">No reviews yet</span>
        )}
      </div>

      {/* Write a review */}
      {!userId && (
        <div className="border border-dashed border-divider rounded p-6 text-center mb-8">
          <p className="text-sm text-muted">
            <Link href="/auth/login" className="text-accent hover:underline font-semibold">
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        </div>
      )}

      {userId && hasReviewed && (
        <div className="border border-accent/20 bg-accent/5 rounded px-4 py-3 text-sm text-accent mb-8">
          You&apos;ve already reviewed this listing.
        </div>
      )}

      {userId && !hasReviewed && (
        <form
          onSubmit={handleSubmit}
          className="border border-divider rounded bg-surface p-5 mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-5">
            Leave a Review
          </p>

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}

          {/* Star picker */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-7 h-7 transition-colors ${
                      s <= (hoverRating || rating) ? 'text-accent' : 'text-divider'
                    }`}
                    fill={s <= (hoverRating || rating) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-muted tabular-nums">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Share your experience with this item..."
              className="w-full px-4 py-3 bg-bg border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <p className="text-xs text-muted mt-1 text-right">{comment.length}/500</p>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => {
            const name =
              review.profiles?.full_name ?? review.profiles?.username ?? 'Buyer'
            return (
              <div key={review.id} className="border border-divider rounded bg-surface p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {review.profiles?.avatar_url ? (
                        <Image
                          src={review.profiles.avatar_url}
                          alt={name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-accent text-xs font-bold">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs text-muted">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-white/80 leading-relaxed">{review.comment}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
