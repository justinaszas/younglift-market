'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (sessionId) {
      setConfirmed(true)
    }
  }, [sessionId])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-3">
          Order Confirmed
        </h1>

        <p className="text-muted text-sm leading-relaxed mb-2">
          Your purchase is complete. The creator has been notified and will prepare your order.
        </p>

        {sessionId && (
          <p className="text-xs text-muted/60 mb-8">
            Reference: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="border border-accent/20 bg-accent/5 rounded p-4 mb-8">
          <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">
            What happens next
          </p>
          <ul className="text-xs text-muted space-y-1 text-left">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">→</span>
              The creator will ship your handmade item directly to you.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">→</span>
              You'll receive email confirmation from Stripe.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">→</span>
              90% of your payment goes directly to the creator.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop">
            <Button size="lg">Continue Shopping</Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
