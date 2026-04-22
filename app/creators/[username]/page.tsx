import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/ListingCard'
import { Button } from '@/components/ui/Button'

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient()
  const { data: creator } = await supabase
    .from('profiles')
    .select('shop_name, full_name, bio')
    .eq('username', params.username)
    .single()

  if (!creator) return { title: 'Creator Not Found' }

  const name = creator.shop_name ?? creator.full_name ?? params.username
  return {
    title: name,
    description: creator.bio ?? `Shop ${name} on Young Lift Market`,
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const supabase = createClient()

  const { data: creator } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .eq('role', 'creator')
    .single()

  if (!creator) notFound()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('creator_id', creator.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const displayName = creator.shop_name ?? creator.full_name ?? params.username
  const totalListings = listings?.length ?? 0

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 sm:h-56 bg-surface border-b border-divider overflow-hidden">
        {creator.banner_url ? (
          <Image
            src={creator.banner_url}
            alt={`${displayName} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,255,178,0.08) 0%, rgba(0,255,178,0.02) 50%, transparent 100%)',
              backgroundImage:
                'linear-gradient(rgba(0,255,178,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,178,0.05) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
      </div>

      {/* Creator info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-bg overflow-hidden bg-surface flex-shrink-0">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/10">
                <span className="text-accent text-4xl font-black">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {displayName}
            </h1>
            <p className="text-muted text-sm mt-0.5">@{params.username}</p>
            {creator.bio && (
              <p className="text-sm text-white/80 mt-2 max-w-xl leading-relaxed">{creator.bio}</p>
            )}
          </div>

          <div className="flex items-center gap-3 sm:pb-2">
            <div className="text-right mr-4 hidden sm:block">
              <div className="text-xl font-black text-white">{totalListings}</div>
              <div className="text-xs text-muted uppercase tracking-wider">Listings</div>
            </div>
            <Button variant="ghost" size="sm">
              Follow
            </Button>
          </div>
        </div>

        {/* Listings */}
        <div className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider">
              Shop ({totalListings})
            </h2>
          </div>

          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="border border-divider rounded bg-surface p-16 text-center">
              <p className="text-muted text-sm">This creator hasn&apos;t listed anything yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
