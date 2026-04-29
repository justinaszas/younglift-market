import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how Young Lift Market connects buyers and independent creators. Browse handmade goods, sell your craft, and get paid — simply.',
}

const BUYER_STEPS = [
  {
    n: '01',
    title: 'Browse the Market',
    body: 'Explore handmade products across jewelry, ceramics, textiles, art, candles, and more. Filter by category, search by keyword, or discover new creators.',
  },
  {
    n: '02',
    title: 'Buy Directly From Creators',
    body: 'Every item is made and sold by an independent creator. When you buy, the money goes straight to the person who made it — no wholesalers, no middlemen.',
  },
  {
    n: '03',
    title: 'Secure Stripe Checkout',
    body: 'Pay confidently with any major card. Checkout is handled entirely by Stripe — your payment details never touch our servers.',
  },
]

const CREATOR_STEPS = [
  {
    n: '01',
    title: 'Apply to Sell',
    body: 'Create a creator account in minutes. Set up your storefront with a shop name, bio, and profile photo — your public page is live immediately.',
  },
  {
    n: '02',
    title: 'Upload Your Listings',
    body: 'Add products with up to 5 photos, a title, description, price, and stock count. Listings go live right away and appear in the shop for buyers to find.',
  },
  {
    n: '03',
    title: 'Get Paid via Stripe Connect',
    body: 'Connect a Stripe account for payouts. When an order is placed, your earnings land directly in your bank. No waiting, no invoicing.',
  },
]

const FAQS = [
  {
    q: 'How much does it cost to sell on Young Lift Market?',
    a: 'We charge a flat 10% platform fee on completed sales. There are no listing fees, no monthly subscriptions, and no setup costs — you only pay when you make a sale.',
  },
  {
    q: 'When and how do creators get paid?',
    a: "Earnings are paid out through Stripe Connect directly to your linked bank account. Once an order is confirmed, your 90% share is scheduled for payout on Stripe's standard rolling basis (typically 2–7 business days).",
  },
  {
    q: 'Who is responsible for shipping?',
    a: 'Shipping is handled entirely by the creator. After an order is placed you package and ship the item, then mark it as shipped in your dashboard. Buyers receive the delivery address at checkout and can track their order status in real time.',
  },
  {
    q: 'What is the return and refund policy?',
    a: 'Returns are negotiated directly between the buyer and the seller. We encourage creators to state their return policy clearly in their listings. If a dispute arises, contact the seller via the built-in messaging system first.',
  },
  {
    q: 'Are all products genuinely handmade?',
    a: 'Yes. Young Lift Market is exclusively for handmade, hand-crafted, and independently produced goods. Mass-produced or drop-shipped items are not permitted. Creators agree to our handmade-only terms when they sign up.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'All payments are processed by Stripe, a PCI-DSS Level 1 certified provider. Young Lift Market never stores card details — we only receive a confirmation once payment succeeds.',
  },
  {
    q: 'Can I message a seller before buying?',
    a: 'Yes. Every listing and creator profile has a "Contact Seller" button. Sign in and start a conversation directly — ask about custom orders, sizing, materials, or shipping timelines before you buy.',
  },
  {
    q: 'How do I become a creator?',
    a: 'Register for a creator account, connect your Stripe account for payouts, and start uploading listings. The whole process takes under 10 minutes.',
  },
]

function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border border-divider rounded bg-surface p-6 flex flex-col gap-4 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -right-2 -top-4 text-[80px] font-black leading-none text-accent/5 select-none pointer-events-none"
      >
        {n}
      </div>
      <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
        <span className="text-accent text-xs font-black tracking-widest">{n}</span>
      </div>
      <div>
        <h3 className="text-base font-black uppercase tracking-tight text-white mb-2">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-divider py-6 last:border-b-0">
      <p className="text-sm font-bold text-white mb-2">{q}</p>
      <p className="text-sm text-muted leading-relaxed">{a}</p>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative border-b border-divider overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div
          aria-hidden
          className="absolute right-0 top-0 w-1/2 h-full opacity-[0.04] pointer-events-none hidden lg:block"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,255,178,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,178,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">
              Marketplace Guide
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[0.9] text-white mb-5">
            How It<br />
            <span className="text-accent">Works.</span>
          </h1>
          <p className="text-muted text-lg max-w-xl leading-relaxed mb-10">
            Young Lift Market connects buyers with independent creators selling one-of-a-kind handmade goods.
            Here's everything you need to know — whether you're shopping or selling.
          </p>

          <div className="flex gap-8">
            {[
              { value: '90%', label: 'Goes to creators' },
              { value: '10%', label: 'Platform fee' },
              { value: '0', label: 'Listing fees' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-accent">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Buyers ───────────────────────────────────────────── */}
      <section className="border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Section 01</p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">For Buyers</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {BUYER_STEPS.map((s) => (
              <StepCard key={s.n} {...s} />
            ))}
          </div>

          <div className="border border-divider rounded bg-surface-2 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Ready to start shopping?</p>
              <p className="text-xs text-muted">Hundreds of handmade items waiting to be found.</p>
            </div>
            <Link href="/shop" className="flex-shrink-0">
              <Button size="sm">Browse the Shop</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Creators ─────────────────────────────────────────── */}
      <section className="border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Section 02</p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">For Creators</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {CREATOR_STEPS.map((s) => (
              <StepCard key={s.n} {...s} />
            ))}
          </div>

          {/* Earnings callout */}
          <div className="border border-accent/20 rounded bg-accent/5 p-5 flex flex-col sm:flex-row gap-5 mb-6">
            <div className="flex-shrink-0">
              <div className="text-5xl font-black text-accent leading-none">90%</div>
              <div className="text-xs uppercase tracking-widest text-accent/70 mt-1">You keep</div>
            </div>
            <div className="border-l border-accent/20 hidden sm:block" />
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-white mb-1">Creators keep 90% of every sale.</p>
              <p className="text-sm text-muted leading-relaxed">
                We charge a flat 10% fee to cover payment processing, platform infrastructure, and support.
                No hidden charges, no per-listing fees, no surprises.
              </p>
            </div>
          </div>

          <div className="border border-divider rounded bg-surface-2 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Ready to sell your work?</p>
              <p className="text-xs text-muted">Set up your shop in under 10 minutes.</p>
            </div>
            <Link href="/auth/register?role=creator" className="flex-shrink-0">
              <Button size="sm">Become a Creator</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="border-b border-divider">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Section 03</p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Frequently Asked Questions
              </h2>
            </div>
          </div>

          <div className="border border-divider rounded bg-surface overflow-hidden px-6">
            {FAQS.map((faq) => (
              <FaqRow key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">
            Get Started
          </p>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4 leading-[0.9]">
            Join the<br />
            <span className="text-accent">Market.</span>
          </h2>
          <p className="text-muted text-base max-w-md mx-auto mb-8">
            Shop one-of-a-kind handmade goods, or open your own shop and start earning today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop">
              <Button size="lg">Browse Listings</Button>
            </Link>
            <Link href="/auth/register?role=creator">
              <Button size="lg" variant="ghost">Open a Shop</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
