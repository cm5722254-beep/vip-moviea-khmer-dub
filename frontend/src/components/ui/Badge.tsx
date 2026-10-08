import React from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'gold' | 'free' | 'new' | 'popular' | 'featured' | 'default' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  className,
}) => {
  const variants: Record<string, string> = {
    gold: 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30',
    free: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    popular: 'bg-red-500/20 text-red-400 border border-red-500/30',
    featured: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    default: 'bg-white/10 text-white/70',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  }

  const sizes: Record<string, string> = {
    sm: 'px-1.5 py-0.5 text-[10px] rounded-md',
    md: 'px-2.5 py-1 text-xs rounded-lg',
  }

  return (
    <span className={cn('inline-flex items-center font-bold uppercase tracking-wide', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

export default Badge
