import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, List } from 'lucide-react'
import { useMovie, useMovieEpisodes } from '../hooks/useMovies'
import { useWatchProgress } from '../hooks/useWatchProgress'
import { useCheckOwnership } from '../hooks/usePurchases'
import { useAuthStore } from '../stores/authStore'
import VideoPlayer from '../components/player/VideoPlayer'
import EpisodeItem from '../components/movies/EpisodeItem'
import { Skeleton } from '../components/ui/Skeleton'
import { showBackButton, hideBackButton } from '../lib/telegram'
import type { Episode } from '../types'

export const WatchPage: React.FC = () => {
  const { movieId, episodeId } = useParams<{ movieId: string; episodeId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [currentEpisodeId, setCurrentEpisodeId] = useState(episodeId!)
  const [showEpisodeList, setShowEpisodeList] = useState(false)

  const { data: movie } = useMovie(movieId!)
  const { data: episodes, isLoading: loadingEpisodes } = useMovieEpisodes(movieId!)
  const { data: progress } = useWatchProgress(currentEpisodeId)
  const { data: ownership } = useCheckOwnership('movie', movieId!)

  const currentEpisode = episodes?.find((ep) => ep.id === currentEpisodeId)
  const currentIndex = episodes?.findIndex((ep) => ep.id === currentEpisodeId) ?? -1
  const hasPrev = currentIndex > 0
  const hasNext = episodes ? currentIndex < episodes.length - 1 : false

  // Gate — must be authenticated and own the movie
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Check if current episode is accessible
  const canWatch = ownership?.owned || currentEpisode?.isFree || movie?.isFree

  useEffect(() => {
    if (ownership !== undefined && currentEpisode !== undefined && !canWatch) {
      navigate(`/movies/${movieId}`)
    }
  }, [ownership, currentEpisode, canWatch, movieId, navigate])

  // Telegram back button
  useEffect(() => {
    showBackButton(() => navigate(`/movies/${movieId}`))
    return () => hideBackButton()
  }, [navigate, movieId])

  // Navigate to episode
  const handleEpisodeSelect = (ep: Episode) => {
    setCurrentEpisodeId(ep.id)
    setShowEpisodeList(false)
    navigate(`/watch/${movieId}/${ep.id}`, { replace: true })
  }

  const handleNextEpisode = () => {
    if (hasNext && episodes) {
      const next = episodes[currentIndex + 1]
      handleEpisodeSelect(next)
    }
  }

  const handlePrevEpisode = () => {
    if (hasPrev && episodes) {
      const prev = episodes[currentIndex - 1]
      handleEpisodeSelect(prev)
    }
  }

  if (!currentEpisode && !loadingEpisodes) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40 font-khmer">មិនឃើញភាគ</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Video player — full width at top */}
      <div className="w-full bg-black">
        {currentEpisode ? (
          <VideoPlayer
            episode={currentEpisode}
            movieId={movieId!}
            startTime={progress?.currentTime || 0}
            onEnded={handleNextEpisode}
            onNextEpisode={handleNextEpisode}
            onPrevEpisode={handlePrevEpisode}
            hasNext={hasNext}
            hasPrev={hasPrev}
            episodes={episodes}
            onEpisodeSelect={handleEpisodeSelect}
          />
        ) : (
          <Skeleton className="w-full aspect-video" />
        )}
      </div>

      {/* Below player */}
      <div className="flex-1 bg-[#0a0a0f]">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button
            onClick={() => navigate(`/movies/${movieId}`)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-xs font-khmer truncate max-w-[140px]">
              {movie?.titleKh || movie?.title}
            </span>
          </button>
          <button
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-khmer"
          >
            <List size={16} />
            ភាគ ({episodes?.length || 0})
          </button>
        </div>

        {/* Current episode info */}
        {currentEpisode && (
          <div className="px-4 py-4">
            <h2 className="text-white font-semibold font-khmer text-base">
              ភាគទី {currentEpisode.episodeNumber}: {currentEpisode.titleKh || currentEpisode.title}
            </h2>
            {(currentEpisode.descriptionKh || currentEpisode.description) && (
              <p className="text-white/40 text-xs font-khmer mt-1.5 leading-5 line-clamp-2">
                {currentEpisode.descriptionKh || currentEpisode.description}
              </p>
            )}
          </div>
        )}

        {/* Episode list */}
        {showEpisodeList && (
          <div className="px-4 pb-4">
            <h3 className="text-white/50 text-xs font-khmer mb-3 uppercase tracking-wide">
              ភាគទាំងអស់
            </h3>
            {loadingEpisodes ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {episodes?.map((ep) => (
                  <EpisodeItem
                    key={ep.id}
                    episode={ep}
                    isOwned={ownership?.owned || movie?.isFree}
                    isActive={ep.id === currentEpisodeId}
                    onPlay={handleEpisodeSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WatchPage
