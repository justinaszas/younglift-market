'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

function OnboardingForm() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, shop_name, bio, location, avatar_url')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'creator') { router.push('/'); return }

      // Already completed onboarding — skip
      if (profile.location) { router.push('/dashboard'); return }

      setUserId(user.id)
      setShopName(profile.shop_name ?? '')
      setBio(profile.bio ?? '')
      setLocation(profile.location ?? '')
      if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
      setLoading(false)
    }
    init()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setError(null)

    let avatarUrl: string | undefined

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (uploadError) {
        setError('Avatar upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = urlData.publicUrl
    }

    const updates: Record<string, string> = {
      shop_name: shopName,
      bio,
      location,
    }
    if (avatarUrl) updates.avatar_url = avatarUrl

    const { error: saveError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  if (loading) {
    return <div className="min-h-[80vh]" />
  }

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-10">
          <div className="flex-1 h-0.5 bg-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Set up your shop
          </span>
          <div className="flex-1 h-0.5 bg-divider" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            One last step.
          </h1>
          <p className="text-muted text-sm">
            Tell buyers who you are. This appears on your public shop page.
          </p>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded px-4 py-3 text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden bg-surface border-2 border-dashed border-divider hover:border-accent transition-colors flex-shrink-0 group"
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {avatarPreview ? 'Change photo' : 'Upload photo'}
                </button>
                <p className="text-xs text-muted mt-1">JPG or PNG, max 5MB. Optional.</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Shop name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Shop Name <span className="text-red-400">*</span>
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

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Portland, OR"
              className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
            <p className="text-xs text-muted mt-1">City, state or country. Shown on your shop page.</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about you and your craft..."
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <p className="text-xs text-muted mt-1 text-right">{bio.length}/300</p>
          </div>

          <Button type="submit" fullWidth size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Finish & Go to Dashboard →'}
          </Button>

          <p className="text-center text-xs text-muted">
            You can update all of this later from your dashboard settings.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <OnboardingForm />
    </Suspense>
  )
}
