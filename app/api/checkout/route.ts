import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, profiles(*)')
      .eq('id', listingId)
      .eq('is_active', true)
      .gt('stock', 0)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found or unavailable' }, { status: 404 })
    }

    const creator = listing.profiles
    if (!creator?.stripe_account_id || !creator?.stripe_onboarded) {
      return NextResponse.json(
        { error: 'Creator has not set up payments yet' },
        { status: 400 }
      )
    }

    const amountInCents = Math.round(listing.price * 100)
    const feeInCents = Math.round(amountInCents * PLATFORM_FEE_PERCENT)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: listing.title,
              images: listing.images?.slice(0, 1) ?? [],
              description: listing.description ?? undefined,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listing.id}`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'ES', 'IT'],
      },
      payment_intent_data: {
        application_fee_amount: feeInCents,
        transfer_data: {
          destination: creator.stripe_account_id,
        },
      },
      metadata: {
        listing_id: listing.id,
        buyer_id: user.id,
        creator_id: creator.id,
      },
    })

    await supabase.from('orders').insert({
      buyer_id: user.id,
      listing_id: listing.id,
      amount: listing.price,
      platform_fee: listing.price * PLATFORM_FEE_PERCENT,
      stripe_session_id: session.id,
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
