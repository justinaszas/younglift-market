import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-black text-accent mb-4">404</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-muted text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/shop">
            <Button variant="ghost">Browse Shop</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
