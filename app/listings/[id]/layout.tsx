import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('title, description, images, profiles(shop_name, full_name)')
    .eq('id', params.id)
    .single()

  if (!data) return { title: 'Listing Not Found' }

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
  const creatorName = profile?.shop_name ?? profile?.full_name ?? 'an independent creator'
  const title = data.title
  const description = data.description
    ? data.description.slice(0, 160)
    : `${title} — handmade by ${creatorName} on Young Lift Market.`
  const image = (data.images as string[] | null)?.[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default function ListingLayout({ children }: Pick<Props, 'children'>) {
  return <>{children}</>
}
