import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Star, Play, ShoppingCart, Lock,
  Clock, Film, Globe, ChevronDown, ChevronUp
} from 'lucide-react'
import { useMovie, useMovieEpisodes } from '../hooks/useMovies'
import { useCheckOwnership } from '../hooks/usePurchases'
import { useMovieWatchProgress } from '../hooks/useWatchProgress'
import { useAuthStore } from '../stores/authStore'
import PurchaseModal from '../components/purchases/PurchaseModal'
import EpisodeItem from '../components/movies/EpisodeItem'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Skeleton, EpisodeSkeleton } from '../components/ui/Skeleton'
import { formatDuration } from '../lib/utils'
import type { Episode } from '../types'

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [showPurchase, setShowPurchase] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [purchaseType, setPurchaseType] = useState<'movie' | 'episode'>('movie')

  const { data: movie, isLoading: loadingMovie } = useMovie(id!)
  const { data: episodes, isLoading: loadingEpisodes } = useMovieEpisodes(id!)
  const { data: ownership } = useCheckOwnership('movie', id!)
  const { data: progressList } = useMovieWatchProgress(id!)

  const isOwned = ownership?.owned || movie?.isFree

  const getProgress = (episodeId: string) =>
    progressList?.find((p) => p.episodeId === episodeId) || null

  const handlePlayEpisode = (ep: Episode) => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    navigate(`/watch/${id}/${ep.id}`)
  }

  const handlePurchaseEpisode = (ep: Episode) => {
    setSelectedEpisode(ep)
    setPurchaseType('episode')
    setShowPurchase(true)
  }

  const handlePurchaseMovie = () => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    setPurchaseType('movie')
    setSelectedEpisode(null)
    setShowPurchase(true)
  }

  const handleWatchFirst = () => {
    const firstEp = episodes?.[0]
    if (firstEp) handlePlayEpisode(firstEp)
  }

  // Find most recently watched episode for "continue" button
  const lastWatched = progressList
    ?.filter((p) => !p.completed)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())[0]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Banner */}
      <div className="relative h-72">
        {loadingMovie ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <img
              src={movie?.bannerUrl || movie?.posterUrl || ''}
              alt={movie?.titleKh}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0a0a0f]" />
          </>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10">
        {loadingMovie ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : movie ? (
          <>
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.isFree && <Badge variant="free">ឥតគិតថ្លៃ</Badge>}
              {movie.isNew && <Badge variant="new">ថ្មី</Badge>}
              {movie.isPopular && <Badge variant="popular">ពេញនិយម</Badge>}
              {movie.isFeatured && <Badge variant="featured">ពិសេស</Badge>}
              {movie.category && (
                <Badge variant="default">{movie.category.nameKh || movie.category.name}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-white text-2xl font-bold font-khmer leading-tight mb-1">
              {movie.titleKh || movie.title}
            </h1>
            {movie.titleKh && movie.title !== movie.titleKh && (
              <p className="text-white/40 text-sm mb-3">{movie.title}</p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 mb-4 text-white/50 text-xs">
              {movie.rating && (
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#d4af37" className="text-[#d4af37]" />
                  <span className="text-[#d4af37] font-semibold">{movie.rating.toFixed(1)}</span>
                </div>
              )}
              {movie.year && <span>{movie.year}</span>}
              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatDuration(movie.duration * 60)}</span>
                </div>
              )}
              {movie.episodesCount && (
                <div className="flex items-center gap-1">
                  <Film size={12} />
                  <span>{movie.episodesCount} ភាគ</span>
                </div>
              )}
              {movie.language && (
                <div className="flex items-center gap-1">
                  <Globe size={12} />
                  <span>{movie.language}</span>
                </div>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex gap-3 mb-5">
              {isOwned ? (
                <>
                  {lastWatched ? (
                    <Button
                      variant="gold"
                      fullWidth
                      leftIcon={<Play size={18} fill="#0a0a0f" />}
                      onClick={() => navigate(`/watch/${id}/${lastWatched.episodeId}`)}
                    >
                      បន្តមើល ភាគ {lastWatched.episode?.episodeNumber}
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      fullWidth
                      leftIcon={<Play size={18} fill="#0a0a0f" />}
                      onClick={handleWatchFirst}
                    >
                      មើលឥឡូវ
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="gold"
                    fullWidth
                    leftIcon={<ShoppingCart size={16} />}
                    onClick={handlePurchaseMovie}
                  >
                    ទិញ {movie.isFree ? '' : `$${movie.price.toFixed(2)}`}
                  </Button>
                  {episodes && episodes.some((ep) => ep.isFree) && (
                    <Button
                      variant="secondary"
                      onClick={handleWatchFirst}
                      leftIcon={<Play size={16} />}
                    >
                      ភាគទី ១
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            {(movie.descriptionKh || movie.description) && (
              <div className="mb-5">
                <p
                  className={`text-white/60 text-sm font-khmer leading-6 ${
                    !descExpanded ? 'line-clamp-3' : ''
                  }`}
                >
                  {movie.descriptionKh || movie.description}
                </p>
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="flex items-center gap-1 text-[#d4af37] text-xs font-khmer mt-1"
                >
                  {descExpanded ? (
                    <>
                      បង្រួម <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      បង្ហាញបន្ថែម <ChevronDown size={14} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Tags */}
            {movie.tags && movie.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {movie.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/5 rounded-full text-white/40 text-[10px] font-khmer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Episodes */}
            <div>
              <h2 className="text-white font-semibold text-base font-khmer mb-3 flex items-center gap-2">
                <Film size={16} className="text-[#d4af37]" />
                ភាគ ({episodes?.length || 0})
              </h2>

              {loadingEpisodes ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <EpisodeSkeleton key={i} />
                  ))}
                </div>
              ) : episodes && episodes.length > 0 ? (
                <div className="space-y-2">
                  {episodes.map((ep) => (
                    <EpisodeItem
                      key={ep.id}
                      episode={ep}
                      isOwned={isOwned}
                      progress={getProgress(ep.id)}
                      onPlay={handlePlayEpisode}
                      onPurchase={handlePurchaseEpisode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/30 font-khmer text-sm">
                  មិនមានភាគ
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-white/40 font-khmer">
            <Lock size={40} className="mx-auto mb-3 opacity-20" />
            រកមិនឃើញរឿង
          </div>
        )}
      </div>

      {/* Purchase modal */}
      <PurchaseModal
        isOpen={showPurchase}
        onClose={() => setShowPurchase(false)}
        type={purchaseType}
        movie={movie}
        episode={selectedEpisode || undefined}
        onSuccess={() => {
          setShowPurchase(false)
        }}
      />
    </div>
  )
}

export default MovieDetailPage
