import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 active:scale-95 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]'

  const variants: Record<string, string> = {
    gold: 'bg-gradient-to-r from-[#d4af37] to-[#f5c842] text-[#0a0a0f] hover:brightness-110 focus:ring-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)]',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
    secondary: 'bg-[#1a1a24] text-white border border-white/10 hover:bg-[#252535] focus:ring-white/20',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    outline: 'border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 focus:ring-[#d4af37]',
  }

  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg',
  }

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

export default Button
