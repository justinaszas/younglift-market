import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can connect Stripe' }, { status: 403 })
    }

    let accountId = profile?.stripe_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id

      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id)
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect?account_id=${accountId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('account_id')

  if (!accountId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  try {
    const supabase = createClient()
    const account = await stripe.accounts.retrieve(accountId)

    const isOnboarded =
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled

    if (isOnboarded) {
      await supabase
        .from('profiles')
        .update({ stripe_onboarded: true })
        .eq('stripe_account_id', accountId)
    }

    return NextResponse.redirect(
      new URL(`/dashboard?stripe=${isOnboarded ? 'success' : 'incomplete'}`, request.url)
    )
  } catch {
    return NextResponse.redirect(new URL('/dashboard?stripe=error', request.url))
  }
}
