import Image from 'next/image'
import Link from 'next/link'
import { Profile } from '@/types/database'
import { truncate } from '@/lib/utils'

interface CreatorCardProps {
  creator: Profile
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const displayName = creator.shop_name ?? creator.full_name ?? 'Creator'
  const username = creator.username ?? creator.id

  return (
    <Link href={`/creators/${username}`} className="group block flex-shrink-0 w-48">
      <div className="flex flex-col items-center text-center gap-3 p-4 bg-surface border border-divider rounded card-hover">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-2 border-2 border-divider group-hover:border-accent transition-colors">
          {creator.avatar_url ? (
            <Image
              src={creator.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/10">
              <span className="text-accent text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-accent transition-colors leading-tight">
            {displayName}
          </h3>
          {creator.bio && (
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {truncate(creator.bio, 60)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
