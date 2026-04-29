import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Discover unique handmade goods from independent creators. Browse jewelry, ceramics, textiles, prints, candles, and more on Young Lift Market.',
  openGraph: {
    title: 'Shop — Young Lift Market',
    description:
      'Discover unique handmade goods from independent creators. Browse jewelry, ceramics, textiles, prints, candles, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Shop — Young Lift Market',
    description: 'Discover unique handmade goods from independent creators.',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
