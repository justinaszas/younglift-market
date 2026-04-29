'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { formatPriceFromDollars } from '@/lib/utils'
import { Order } from '@/types/database'

const STATUS_VARIANT: Record<string, 'accent' | 'default' | 'muted'> = {
  paid: 'accent',
  completed: 'accent',
  shipped: 'default',
  pending: 'muted',
  cancelled: 'muted',
}

export default function MyOrdersPage() {
  const supabase = createClient()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?next=/dashboard/orders')
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('*, listings(*, profiles(*))')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      setOrders((data ?? []) as Order[])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-3">
        <div className="h-8 bg-surface rounded w-40 mb-8" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-surface rounded border border-divider" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1">My Orders</h1>
        <p className="text-muted text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-muted text-sm mb-4">No orders yet.</p>
          <Link href="/shop" className="text-accent hover:underline text-sm font-semibold">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const listing = order.listings
            const creator = listing?.profiles
            const creatorName = creator?.shop_name ?? creator?.full_name ?? 'Creator'

            return (
              <div
                key={order.id}
                className="border border-divider rounded bg-surface overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-divider bg-surface-2">
                  <span className="text-xs text-muted">
                    Order <span className="text-white font-mono">#{order.id.slice(0, 8)}</span>
                    {' · '}
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                    {order.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-16 h-16 rounded bg-surface-2 flex-shrink-0 overflow-hidden border border-divider">
                    {listing?.images?.[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/30">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {listing ? (
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-sm font-semibold text-white hover:text-accent transition-colors truncate block"
                      >
                        {listing.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-muted">Listing removed</p>
                    )}
                    {creator && (
                      <Link
                        href={`/creators/${creator.username ?? creator.id}`}
                        className="text-xs text-muted hover:text-accent transition-colors mt-0.5 block"
                      >
                        by {creatorName}
                      </Link>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-accent">
                      {formatPriceFromDollars(order.amount)}
                    </p>
                  </div>
                </div>

                {order.shipping_address && (
                  <div className="px-4 pb-4">
                    <div className="text-xs text-muted bg-surface-2 rounded px-3 py-2 border border-divider">
                      <span className="font-semibold text-white/70 uppercase tracking-wider text-[10px]">
                        Ship to
                      </span>
                      <p className="mt-0.5">
                        {order.shipping_address.name} · {order.shipping_address.line1}
                        {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''},{' '}
                        {order.shipping_address.city}, {order.shipping_address.state}{' '}
                        {order.shipping_address.postal_code}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
