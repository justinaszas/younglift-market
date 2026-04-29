'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const HEART =
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'

interface Props {
  listingId: string
  initialSaved?: boolean
  className?: string
  onToggle?: (newSaved: boolean) => void
}

export function WishlistButton({ listingId, initialSaved, className = '', onToggle }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      if (user) {
        if (initialSaved !== undefined) {
          setSaved(initialSaved)
        } else {
          const { data } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', listingId)
            .maybeSingle()
          setSaved(!!data)
        }
      }
      setReady(true)
    }
    init()
  }, [listingId, initialSaved])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/auth/login')
      return
    }

    const next = !saved
    setSaved(next)
    onToggle?.(next)

    if (!next) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId)
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: userId, listing_id: listingId })
    }
  }

  if (!ready) return null

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`group flex items-center justify-center transition-all ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-all duration-150 ${
          saved
            ? 'text-red-500 scale-110'
            : 'text-white/60 group-hover:text-red-400 group-hover:scale-110'
        }`}
        fill={saved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={HEART} />
      </svg>
    </button>
  )
}
