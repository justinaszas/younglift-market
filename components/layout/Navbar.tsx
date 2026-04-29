'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const [{ data: profileData }, { count }] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', user.id).single(),
          supabase
            .from('wishlists')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ])
        setRole(profileData?.role ?? null)
        setWishlistCount(count ?? 0)
      }
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-divider bg-bg/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-accent font-black uppercase tracking-widest text-lg">
              Young Lift
            </span>
            <span className="text-white/50 text-xs font-light uppercase tracking-widest hidden sm:block">
              Market
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-sm font-semibold uppercase tracking-wider text-muted hover:text-white transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/shop?view=creators"
              className="text-sm font-semibold uppercase tracking-wider text-muted hover:text-white transition-colors"
            >
              Creators
            </Link>
            {role === 'creator' && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold uppercase tracking-wider text-muted hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative p-2 text-muted hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm hover:bg-accent/30 transition-colors"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-divider rounded shadow-xl py-1 z-50">
                    {role === 'creator' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-white hover:text-accent hover:bg-surface-2 transition-colors"
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-white hover:text-accent hover:bg-surface-2 transition-colors"
                    >
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-1.5 text-xs text-muted">({wishlistCount})</span>
                      )}
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-white hover:text-accent hover:bg-surface-2 transition-colors"
                    >
                      My Orders
                    </Link>
                    <hr className="border-divider my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-muted hover:text-white hover:bg-surface-2 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Join</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-divider py-4 space-y-3">
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-muted hover:text-white py-2"
            >
              Shop
            </Link>
            <Link
              href="/shop?view=creators"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-muted hover:text-white py-2"
            >
              Creators
            </Link>
            {role === 'creator' && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold uppercase tracking-wider text-muted hover:text-white py-2"
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted hover:text-white py-2"
              >
                Wishlist
                {wishlistCount > 0 && (
                  <span className="text-xs font-normal text-accent normal-case tracking-normal">
                    ({wishlistCount})
                  </span>
                )}
              </Link>
            )}
            <div className="flex gap-3 pt-2">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm text-muted hover:text-white"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm">Join</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  )
}
