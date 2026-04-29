import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://youngliftmarket.com'),
  title: {
    default: 'Young Lift Market — Handmade Crafts Marketplace',
    template: '%s | Young Lift Market',
  },
  description:
    'Discover and buy unique handmade goods from independent creators. Young Lift Market connects you with talented artisans worldwide.',
  keywords: ['handmade', 'crafts', 'marketplace', 'artisan', 'independent creators'],
  openGraph: {
    siteName: 'Young Lift Market',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    site: '@youngliftmarket',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-white antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
