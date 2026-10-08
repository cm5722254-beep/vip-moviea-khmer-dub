import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Lock } from 'lucide-react'
import { cn } from '../../lib/utils'
import Badge from '../ui/Badge'
import type { Movie } from '../../types'

interface MovieCardProps {
  movie: Movie
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showPrice?: boolean
}

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="220" viewBox="0 0 150 220"%3E%3Crect width="150" height="220" fill="%231a1a24"/%3E%3Ctext x="75" y="115" text-anchor="middle" fill="%23ffffff30" font-size="40"%3E🎬%3C/text%3E%3C/svg%3E'

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  size = 'md',
  className,
  showPrice = true,
}) => {
  const navigate = useNavigate()

  const sizes = {
    sm: { card: 'w-28', poster: 'h-40' },
    md: { card: 'w-36', poster: 'h-52' },
    lg: { card: 'w-44', poster: 'h-64' },
  }

  const { card, poster } = sizes[size]

  return (
    <div
      className={cn('flex-shrink-0 cursor-pointer group', card, className)}
      onClick={() => navigate(`/movies/${movie.id}`)}
    >
      {/* Poster */}
      <div className={cn('relative rounded-xl overflow-hidden bg-[#1a1a24]', poster)}>
        <img
          src={movie.posterUrl || FALLBACK_IMG}
          alt={movie.titleKh || movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = FALLBACK_IMG
          }}
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/90 flex items-center justify-center">
            <Play size={18} fill="#0a0a0f" className="text-[#0a0a0f] ml-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {movie.isFree && <Badge variant="free">FREE</Badge>}
          {movie.isNew && !movie.isFree && <Badge variant="new">NEW</Badge>}
          {movie.isPopular && <Badge variant="popular">HOT</Badge>}
          {movie.isFeatured && !movie.isPopular && <Badge variant="featured">★</Badge>}
        </div>

        {/* Lock icon for paid */}
        {!movie.isFree && (
          <div className="absolute bottom-2 right-2">
            <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Lock size={10} className="text-[#d4af37]" />
            </div>
          </div>
        )}

        {/* Episode count */}
        {movie.episodesCount && movie.episodesCount > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-white text-[9px] font-medium">{movie.episodesCount} ភាគ</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1">
        <p className="text-white text-xs font-semibold font-khmer line-clamp-2 leading-4">
          {movie.titleKh || movie.title}
        </p>
        <div className="flex items-center justify-between">
          {movie.category && (
            <span className="text-white/40 text-[10px] font-khmer truncate">
              {movie.category.nameKh || movie.category.name}
            </span>
          )}
          {showPrice && (
            <span
              className={cn(
                'text-[10px] font-bold ml-auto',
                movie.isFree ? 'text-emerald-400' : 'text-[#d4af37]'
              )}
            >
              {movie.isFree ? 'ឥតគិតថ្លៃ' : `$${movie.price.toFixed(2)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieCard
