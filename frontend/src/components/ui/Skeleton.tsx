import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
      'animate-[skeleton_1.5s_ease-in-out_infinite] rounded-lg',
      className
    )}
  />
)

export const MovieCardSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-36">
    <Skeleton className="w-36 h-52 rounded-xl mb-2" />
    <Skeleton className="h-4 w-28 mb-1" />
    <Skeleton className="h-3 w-16" />
  </div>
)

export const MovieGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-3 gap-3 px-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <Skeleton className="w-full aspect-[2/3] rounded-xl mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
)

export const EpisodeSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4 bg-[#1a1a24] rounded-xl">
    <Skeleton className="w-24 h-14 rounded-lg flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
  </div>
)

export const TransactionSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-5 w-16" />
  </div>
)

export const ProfileSkeleton: React.FC = () => (
  <div className="flex flex-col items-center gap-4 p-6">
    <Skeleton className="w-24 h-24 rounded-full" />
    <Skeleton className="h-6 w-40" />
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-16 w-full rounded-2xl" />
  </div>
)

export default Skeleton
