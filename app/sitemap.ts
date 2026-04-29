import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://youngliftmarket.com').replace(/\/$/, '')
  const supabase = createClient()

  const [{ data: listings }, { data: creators }] = await Promise.all([
    supabase
      .from('listings')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('username, updated_at')
      .eq('role', 'creator')
      .not('username', 'is', null),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/shop`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${base}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${base}/listings/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const creatorRoutes: MetadataRoute.Sitemap = (creators ?? [])
    .filter((c) => c.username)
    .map((c) => ({
      url: `${base}/creators/${c.username}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticRoutes, ...listingRoutes, ...creatorRoutes]
}
