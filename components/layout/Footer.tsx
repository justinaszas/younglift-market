import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-divider mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-accent font-black uppercase tracking-widest text-lg">
                Young Lift Market
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              A curated marketplace for independent creators. Handmade, rare, and uniquely yours.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'All Listings', href: '/shop' },
                { label: 'Creators', href: '/shop?view=creators' },
                { label: 'Jewelry', href: '/shop?category=Jewelry' },
                { label: 'Ceramics', href: '/shop?category=Ceramics' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Sell
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Become a Creator', href: '/auth/register?role=creator' },
                { label: 'Creator Dashboard', href: '/dashboard' },
                { label: 'How It Works', href: '#' },
                { label: 'Fees & Payments', href: '#' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-divider pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Young Lift Market. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse" />
            Creators keep 90% of every sale
          </div>
        </div>
      </div>
    </footer>
  )
}
