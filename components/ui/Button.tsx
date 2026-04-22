import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'filled',
  size = 'md',
  className,
  children,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-accent text-black hover:bg-accent/90 active:scale-[0.98]': variant === 'filled',
          'bg-transparent text-accent border border-accent hover:bg-accent/10': variant === 'ghost',
          'bg-transparent text-white border border-divider hover:border-accent hover:text-accent':
            variant === 'outline',
        },
        {
          'px-3 py-1.5 text-xs rounded-sm': size === 'sm',
          'px-5 py-2.5 text-sm rounded': size === 'md',
          'px-8 py-4 text-sm rounded': size === 'lg',
        },
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
