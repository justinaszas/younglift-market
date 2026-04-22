import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const listingId = session.metadata?.listing_id
        const buyerId = session.metadata?.buyer_id

        if (session.payment_status === 'paid') {
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              shipping_address: session.shipping_details?.address
                ? {
                    name: session.shipping_details.name ?? '',
                    line1: session.shipping_details.address.line1 ?? '',
                    line2: session.shipping_details.address.line2 ?? undefined,
                    city: session.shipping_details.address.city ?? '',
                    state: session.shipping_details.address.state ?? '',
                    postal_code: session.shipping_details.address.postal_code ?? '',
                    country: session.shipping_details.address.country ?? '',
                  }
                : null,
            })
            .eq('stripe_session_id', session.id)

          if (listingId) {
            await supabase.rpc('decrement_stock', { listing_id: listingId })
          }
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        const isOnboarded =
          account.details_submitted && account.charges_enabled && account.payouts_enabled

        await supabase
          .from('profiles')
          .update({ stripe_onboarded: isOnboarded })
          .eq('stripe_account_id', account.id)
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
