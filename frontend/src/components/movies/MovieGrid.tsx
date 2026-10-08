import React from 'react'
import { cn } from '../../lib/utils'
import MovieCard from './MovieCard'
import { MovieGridSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import type { Movie } from '../../types'

interface MovieGridProps {
  movies?: Movie[]
  isLoading?: boolean
  className?: string
  columns?: 2 | 3 | 4
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  isLoading,
  className,
  columns = 3,
}) => {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns]

  if (isLoading) return <MovieGridSkeleton count={columns * 2} />

  if (!movies || movies.length === 0) {
    return <EmptyState type="movies" />
  }

  return (
    <div className={cn(`grid ${colClass} gap-3 px-4`, className)}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          size={columns === 4 ? 'sm' : 'md'}
          className="w-full"
        />
      ))}
    </div>
  )
}

export default MovieGrid
