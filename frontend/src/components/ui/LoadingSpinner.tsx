import React from 'react'
import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'gold' | 'white'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'gold',
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  const colors = {
    gold: 'border-[#d4af37]/20 border-t-[#d4af37]',
    white: 'border-white/20 border-t-white',
  }

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
      )}
    />
  )
}

export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center z-50">
    <LoadingSpinner size="xl" />
    <p className="mt-4 text-white/40 text-sm font-khmer animate-pulse">កំពុងផ្ទុក...</p>
  </div>
)

export default LoadingSpinner
