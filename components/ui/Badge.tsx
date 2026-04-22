import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-sm',
        {
          'bg-divider text-white': variant === 'default',
          'bg-accent/10 text-accent border border-accent/30': variant === 'accent',
          'bg-surface text-muted': variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
