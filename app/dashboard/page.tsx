'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPriceFromDollars } from '@/lib/utils'
import { Listing, Order, Profile } from '@/types/database'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'orders'>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab === 'listings' || tab === 'orders') return tab
    }
    return 'overview'
  })
  const [connectLoading, setConnectLoading] = useState(false)
  const [stripeStatus] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('stripe')
    }
    return null
  })

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const [{ data: profileData }, { data: listingsData }, { data: ordersData }] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase
            .from('listings')
            .select('*')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('orders')
            .select('*, listings(*, profiles(*))')
            .in(
              'listing_id',
              (
                await supabase
                  .from('listings')
                  .select('id')
                  .eq('creator_id', user.id)
              ).data?.map((l) => l.id) ?? []
            )
            .order('created_at', { ascending: false }),
        ])

      if (profileData?.role !== 'creator') {
        router.push('/')
        return
      }

      setProfile(profileData)
      setListings(listingsData ?? [])
      setOrders(ordersData ?? [])
      setLoading(false)
    }

    load()
  }, [])

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const handleToggleActive = async (listing: Listing) => {
    const { data } = await supabase
      .from('listings')
      .update({ is_active: !listing.is_active })
      .eq('id', listing.id)
      .select()
      .single()
    if (data) {
      setListings((prev) => prev.map((l) => (l.id === listing.id ? data : l)))
    }
  }

  const handleStripeConnect = async () => {
    setConnectLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Failed to connect Stripe')
      }
    } catch {
      alert('Failed to connect Stripe. Please try again.')
    } finally {
      setConnectLoading(false)
    }
  }

  const totalEarnings = orders
    .filter((o) => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + (o.amount - o.platform_fee), 0)

  const totalSales = orders.filter(
    (o) => o.status === 'paid' || o.status === 'completed'
  ).length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-surface rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            {profile?.shop_name ?? 'Dashboard'}
          </h1>
          <p className="text-muted text-sm mt-1">Creator dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          {profile?.stripe_onboarded ? (
            <span className="text-xs font-bold uppercase tracking-wider text-accent border border-accent/30 rounded px-3 py-1.5">
              ✓ Stripe Connected
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleStripeConnect} disabled={connectLoading}>
              {connectLoading ? 'Connecting...' : '⚡ Connect Stripe'}
            </Button>
          )}
          <Link href="/dashboard/new-listing">
            <Button size="sm">+ New Listing</Button>
          </Link>
        </div>
      </div>

      {/* Stripe status banners */}
      {stripeStatus === 'success' && (
        <div className="border border-accent/30 bg-accent/10 rounded px-4 py-3 mb-6">
          <p className="text-sm text-accent font-semibold">
            Stripe connected — you can now receive payments.
          </p>
        </div>
      )}
      {(stripeStatus === 'incomplete' || stripeStatus === 'refresh') && (
        <div className="border border-yellow-500/30 bg-yellow-500/10 rounded px-4 py-3 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-yellow-300">
            Stripe setup incomplete. Finish connecting to accept payments.
          </p>
          <Button size="sm" variant="outline" onClick={handleStripeConnect} disabled={connectLoading}>
            {connectLoading ? '...' : 'Continue Setup'}
          </Button>
        </div>
      )}
      {stripeStatus === 'error' && (
        <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-red-400">
            Stripe connection failed. Please try again.
          </p>
          <Button size="sm" variant="outline" onClick={handleStripeConnect} disabled={connectLoading}>
            {connectLoading ? '...' : 'Retry'}
          </Button>
        </div>
      )}
      {!profile?.stripe_onboarded && !stripeStatus && (
        <div className="border border-yellow-500/30 bg-yellow-500/10 rounded px-4 py-3 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-yellow-300">
            Connect your Stripe account to start receiving payments.
          </p>
          <Button size="sm" variant="outline" onClick={handleStripeConnect} disabled={connectLoading}>
            {connectLoading ? '...' : 'Connect Now'}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-divider mb-8">
        {(['overview', 'listings', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Earnings', value: formatPriceFromDollars(totalEarnings), sub: 'After platform fee' },
              { label: 'Total Sales', value: totalSales.toString(), sub: 'Completed orders' },
              { label: 'Listings', value: listings.length.toString(), sub: `${listings.filter((l) => l.is_active).length} active` },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-divider rounded p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-accent">{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {orders.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                Recent Orders
              </h2>
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="border border-divider rounded bg-surface p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {order.listings?.title ?? 'Listing removed'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-accent">
                        {formatPriceFromDollars(order.amount - order.platform_fee)}
                      </span>
                      <Badge
                        variant={
                          order.status === 'paid' || order.status === 'completed'
                            ? 'accent'
                            : 'default'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Listings tab */}
      {activeTab === 'listings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
            <Link href="/dashboard/new-listing">
              <Button size="sm">+ Add Listing</Button>
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="border border-dashed border-divider rounded p-16 text-center">
              <p className="text-muted text-sm mb-4">You haven&apos;t listed anything yet.</p>
              <Link href="/dashboard/new-listing">
                <Button variant="ghost">Create Your First Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="border border-divider rounded bg-surface p-4 flex items-center gap-4"
                >
                  <div className="relative w-14 h-14 rounded bg-surface-2 flex-shrink-0 overflow-hidden">
                    {listing.images?.[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="56px"
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
                    <p className="text-sm font-semibold text-white truncate">{listing.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-accent font-bold">
                        {formatPriceFromDollars(listing.price)}
                      </span>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted">{listing.stock} in stock</span>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted">{listing.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(listing)}
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm border transition-all ${
                        listing.is_active
                          ? 'border-accent/30 text-accent bg-accent/10 hover:bg-accent/20'
                          : 'border-divider text-muted hover:text-white'
                      }`}
                    >
                      {listing.is_active ? 'Live' : 'Draft'}
                    </button>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      <button className="p-1.5 text-muted hover:text-white transition-colors rounded hover:bg-surface-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-1.5 text-muted hover:text-red-400 transition-colors rounded hover:bg-surface-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {activeTab === 'orders' && (
        <div>
          <p className="text-sm text-muted mb-4">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>

          {orders.length === 0 ? (
            <div className="border border-dashed border-divider rounded p-16 text-center">
              <p className="text-muted text-sm">No orders yet. Share your listings to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-divider rounded bg-surface p-4"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {order.listings?.title ?? 'Listing removed'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Order #{order.id.slice(0, 8)} ·{' '}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-accent">
                        {formatPriceFromDollars(order.amount)}
                      </span>
                      <Badge
                        variant={
                          order.status === 'paid' || order.status === 'completed'
                            ? 'accent'
                            : 'default'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  {order.shipping_address && (
                    <div className="text-xs text-muted bg-surface-2 rounded px-3 py-2">
                      <span className="font-semibold text-white">Ship to: </span>
                      {order.shipping_address.name} · {order.shipping_address.line1},{' '}
                      {order.shipping_address.city}, {order.shipping_address.state}{' '}
                      {order.shipping_address.postal_code} · {order.shipping_address.country}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
