'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ListingForm } from '@/components/dashboard/ListingForm'
import { Listing } from '@/types/database'

export default function EditListingPage() {
  const supabase = createClient()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [listing, setListing] = useState<Listing | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id)
        .single()

      if (error || !data) {
        router.push('/dashboard')
        return
      }

      setListing(data)
      setFetchLoading(false)
    }

    fetchListing()
  }, [id])

  const handleSubmit = async (data: Partial<Listing>) => {
    setSaveLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title: data.title,
        description: data.description ?? null,
        price: data.price,
        category: data.category,
        stock: data.stock,
        images: data.images,
      })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setSaveLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-surface rounded w-1/3" />
        <div className="h-64 bg-surface rounded" />
      </div>
    )
  }

  if (!listing) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs font-bold uppercase tracking-wider text-muted hover:text-white transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Edit Listing</h1>
        <p className="text-muted text-sm mt-1 truncate">{listing.title}</p>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <ListingForm initialData={listing} onSubmit={handleSubmit} loading={saveLoading} />
    </div>
  )
}
