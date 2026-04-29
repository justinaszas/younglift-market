'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Conversation, Message } from '@/types/database'

type ConvRow = Conversation & {
  latestMessage: Message | null
  unreadCount: number
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [convs, setConvs] = useState<ConvRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?next=/messages')
        return
      }

      setUserId(user.id)

      const { data: convData } = await supabase
        .from('conversations')
        .select(
          `id, buyer_id, seller_id, listing_id, created_at, updated_at,
           buyer:profiles!buyer_id(id, full_name, username, avatar_url, shop_name),
           seller:profiles!seller_id(id, full_name, username, avatar_url, shop_name),
           listing:listings!listing_id(id, title, images)`
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (!convData || convData.length === 0) {
        setLoading(false)
        return
      }

      const { data: msgData } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at, read_at')
        .in('conversation_id', convData.map((c) => c.id))
        .order('created_at', { ascending: false })

      const latestMsg: Record<string, Message> = {}
      const unreadCounts: Record<string, number> = {}

      for (const msg of msgData ?? []) {
        if (!latestMsg[msg.conversation_id]) latestMsg[msg.conversation_id] = msg as Message
        if (msg.sender_id !== user.id && !msg.read_at) {
          unreadCounts[msg.conversation_id] = (unreadCounts[msg.conversation_id] ?? 0) + 1
        }
      }

      setConvs(
        (convData as unknown as Conversation[]).map((c) => ({
          ...c,
          latestMessage: latestMsg[c.id] ?? null,
          unreadCount: unreadCounts[c.id] ?? 0,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse space-y-3">
        <div className="h-8 bg-surface rounded w-40 mb-8" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded border border-divider" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Messages</h1>

      {convs.length === 0 ? (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-muted text-sm">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((conv) => {
            const other = conv.buyer_id === userId ? conv.seller : conv.buyer
            const otherName = other?.shop_name ?? other?.full_name ?? 'User'

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 border border-divider rounded bg-surface hover:border-accent/30 hover:bg-surface-2 transition-all group"
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-2 flex-shrink-0 border border-divider group-hover:border-accent/30 transition-colors">
                  {other?.avatar_url ? (
                    <Image src={other.avatar_url} alt={otherName} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/10">
                      <span className="text-accent text-sm font-bold">
                        {otherName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-bold ${conv.unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                      {otherName}
                    </p>
                    {conv.latestMessage && (
                      <span className="text-xs text-muted flex-shrink-0">
                        {timeAgo(conv.latestMessage.created_at)}
                      </span>
                    )}
                  </div>
                  {conv.listing && (
                    <p className="text-xs text-accent/70 mb-0.5 truncate">
                      Re: {conv.listing.title}
                    </p>
                  )}
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white/80' : 'text-muted'}`}>
                    {conv.latestMessage
                      ? conv.latestMessage.sender_id === userId
                        ? `You: ${conv.latestMessage.content}`
                        : conv.latestMessage.content
                      : 'No messages yet'}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
