'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'creator' ? 'creator' : 'buyer'
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'buyer' | 'creator'>(defaultRole)
  const [shopName, setShopName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Sign up failed')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      full_name: fullName,
      username: username.toLowerCase().replace(/\s+/g, '-'),
      shop_name: role === 'creator' ? shopName : null,
      bio: bio || null,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.push(role === 'creator' ? '/dashboard' : '/')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Join the market
          </h1>
          <p className="text-muted text-sm">Create your Young Lift Market account.</p>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister} className="space-y-4">
          {error && (
            <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              {/* Role selection */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  I want to...
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(['buyer', 'creator'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-4 border rounded text-left transition-all ${
                        role === r
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-divider bg-surface text-muted hover:border-muted'
                      }`}
                    >
                      <div className="text-sm font-bold uppercase tracking-wide mb-1">
                        {r === 'buyer' ? 'Shop' : 'Sell'}
                      </div>
                      <div className="text-xs">
                        {r === 'buyer'
                          ? 'Browse & buy handmade goods'
                          : 'List & sell your creations'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="your-handle"
                  pattern="[a-zA-Z0-9_-]+"
                  className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-muted mt-1">Letters, numbers, hyphens only.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <Button type="submit" fullWidth size="lg">
                {role === 'creator' ? 'Next: Shop Details →' : 'Create Account'}
              </Button>
            </>
          )}

          {step === 2 && role === 'creator' && (
            <>
              <div className="border border-accent/20 bg-accent/5 rounded px-4 py-3 mb-4">
                <p className="text-xs text-accent font-semibold">Creator account — you&apos;ll keep 90% of each sale.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  placeholder="My Craft Studio"
                  className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell buyers about you and your craft..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Shop'}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <RegisterForm />
    </Suspense>
  )
}
