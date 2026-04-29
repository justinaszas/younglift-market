'use client'

import { useState } from 'react'

interface Props {
  title: string
}

export function ShareButtons({ title }: Props) {
  const [copied, setCopied] = useState(false)

  const getUrl = () => window.location.href

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
    } catch {
      // Fallback for browsers that block clipboard without HTTPS
      const ta = document.createElement('textarea')
      ta.value = getUrl()
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}&via=youngliftmarket`
    window.open(url, '_blank', 'noopener,noreferrer,width=550,height=420')
  }

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=460')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted mr-1">Share</span>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold transition-all ${
          copied
            ? 'border-accent/40 bg-accent/10 text-accent'
            : 'border-divider bg-surface text-muted hover:border-accent/30 hover:text-white'
        }`}
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy link
          </>
        )}
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitter}
        aria-label="Share on X (Twitter)"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-divider bg-surface text-muted text-xs font-semibold hover:border-accent/30 hover:text-white transition-all"
      >
        {/* X logo */}
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Post
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebook}
        aria-label="Share on Facebook"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-divider bg-surface text-muted text-xs font-semibold hover:border-accent/30 hover:text-white transition-all"
      >
        {/* Facebook logo */}
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Share
      </button>
    </div>
  )
}
