import React from 'react'
import { cn } from '../../lib/utils'

interface PriceTagProps {
  price: number
  isFree?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  currency?: string
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  isFree,
  size = 'md',
  className,
  currency = '$',
}) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  if (isFree || price === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-bold',
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          sizes[size],
          className
        )}
      >
        ឥតគិតថ្លៃ
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full font-bold',
        'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40',
        sizes[size],
        className
      )}
    >
      <span className="opacity-70">{currency}</span>
      <span>{price.toFixed(2)}</span>
    </span>
  )
}

export default PriceTag
