'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface Props {
  sellerId: string
  listingId?: string
  variant?: 'filled' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

type UserState = string | null | undefined // undefined=loading, null=guest

export function ContactSellerButton({
  sellerId,
  listingId,
  variant = 'ghost',
  size = 'md',
  fullWidth,
}: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [userId, setUserId] = useState<UserState>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  // Hide while loading auth or if viewer is the seller
  if (userId === undefined || userId === sellerId) return null

  const handleContact = async () => {
    if (!userId) {
      const next = listingId ? `/listings/${listingId}` : '/shop'
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }

    setLoading(true)

    // Reuse existing conversation if one exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', userId)
      .eq('seller_id', sellerId)
      .maybeSingle()

    if (existing) {
      router.push(`/messages/${existing.id}`)
      return
    }

    const { data: created, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: userId, seller_id: sellerId, listing_id: listingId ?? null })
      .select('id')
      .single()

    if (error || !created) {
      setLoading(false)
      return
    }

    router.push(`/messages/${created.id}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={loading}
      onClick={handleContact}
    >
      {loading ? '...' : 'Contact Seller'}
    </Button>
  )
}
