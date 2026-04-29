'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Conversation, Message } from '@/types/database'

function timeLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  return isToday
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [conv, setConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

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
        .eq('id', id)
        .single()

      if (!convData || (convData.buyer_id !== user.id && convData.seller_id !== user.id)) {
        router.push('/messages')
        return
      }

      setConv(convData as unknown as Conversation)

      const { data: msgData } = await supabase
        .from('messages')
        .select(
          'id, conversation_id, sender_id, content, read_at, created_at, sender:profiles!sender_id(id, full_name, username, avatar_url, shop_name)'
        )
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      setMessages((msgData ?? []) as unknown as Message[])
      setLoading(false)

      const unreadIds = (msgData ?? [])
        .filter((m) => m.sender_id !== user.id && !m.read_at)
        .map((m) => m.id)
      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds)
      }
    }

    load()
  }, [id])

  useEffect(() => {
    if (!loading) scrollToBottom()
  }, [loading])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`conv:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        async (payload) => {
          const newMsg = payload.new as Message

          // Own messages are already added optimistically; skip the realtime echo to prevent duplicates
          if (newMsg.sender_id === userId) return

          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, shop_name')
            .eq('id', newMsg.sender_id)
            .single()

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, { ...newMsg, sender: senderData ?? undefined } as unknown as Message]
          })
          scrollToBottom()

          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', newMsg.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, userId])

  const handleSend = async () => {
    if (!content.trim() || !userId || sending) return
    const text = content.trim()
    setContent('')
    setSending(true)

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: id,
      sender_id: userId,
      content: text,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    scrollToBottom()

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({ conversation_id: id, sender_id: userId, content: text })
      .select('id, conversation_id, sender_id, content, read_at, created_at')
      .single()

    if (inserted) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? (inserted as Message) : m))
      )
    } else if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setContent(text)
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse space-y-3">
        <div className="h-16 bg-surface rounded border border-divider mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-10 bg-surface rounded w-2/3 ${i % 2 ? 'ml-auto' : ''}`} />
        ))}
      </div>
    )
  }

  if (!conv) return null

  const other = conv.buyer_id === userId ? conv.seller : conv.buyer
  const otherName = other?.shop_name ?? other?.full_name ?? 'User'

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-divider bg-bg/95 backdrop-blur-sm flex-shrink-0">
        <Link
          href="/messages"
          className="text-muted hover:text-white transition-colors p-1 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-surface-2 flex-shrink-0 border border-divider">
          {other?.avatar_url ? (
            <Image src={other.avatar_url} alt={otherName} fill className="object-cover" sizes="36px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/10">
              <span className="text-accent text-xs font-bold">
                {otherName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{otherName}</p>
          {conv.listing && (
            <p className="text-xs text-accent/70 truncate">Re: {conv.listing.title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    isMine
                      ? 'bg-accent text-black rounded-br-sm'
                      : 'bg-surface border border-divider text-white rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted px-1">{timeLabel(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-divider bg-bg px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="flex-1 resize-none bg-surface border border-divider rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors overflow-y-auto"
            style={{ minHeight: '42px', maxHeight: '128px' }}
          />
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="w-10 h-10 bg-accent text-black rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-4 h-4 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-muted mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
