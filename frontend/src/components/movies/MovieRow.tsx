import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'
import { MovieCardSkeleton } from '../ui/Skeleton'
import type { Movie } from '../../types'

interface MovieRowProps {
  title: string
  movies?: Movie[]
  isLoading?: boolean
  viewAllLink?: string
  cardSize?: 'sm' | 'md' | 'lg'
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  isLoading,
  viewAllLink,
  cardSize = 'md',
}) => {
  const navigate = useNavigate()

  return (
    <section className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-white font-semibold text-base font-khmer flex items-center gap-2">
          <span className="w-1 h-5 bg-[#d4af37] rounded-full" />
          {title}
        </h2>
        {viewAllLink && (
          <button
            onClick={() => navigate(viewAllLink)}
            className="flex items-center gap-0.5 text-[#d4af37] text-xs font-khmer hover:text-[#f5c842] transition-colors"
          >
            មើលទាំងអស់ <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 pl-4 overflow-x-auto scrollbar-hide pb-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies?.map((movie) => (
              <MovieCard key={movie.id} movie={movie} size={cardSize} />
            ))}
        {/* Trailing padding */}
        <div className="w-4 flex-shrink-0" />
      </div>
    </section>
  )
}

export default MovieRow
