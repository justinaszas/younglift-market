'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ListingForm } from '@/components/dashboard/ListingForm'
import { Listing } from '@/types/database'

export default function NewListingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: Partial<Listing>) => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error: insertError } = await supabase.from('listings').insert({
      creator_id: user.id,
      title: data.title!,
      description: data.description ?? null,
      price: data.price!,
      category: data.category!,
      stock: data.stock!,
      images: data.images ?? [],
      is_active: true,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard?tab=listings')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs font-bold uppercase tracking-wider text-muted hover:text-white transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">New Listing</h1>
        <p className="text-muted text-sm mt-1">Fill in the details and publish your item.</p>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <ListingForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
