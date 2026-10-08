import React from 'react'
import { Lock, Play, CheckCircle } from 'lucide-react'
import { cn, formatDuration } from '../../lib/utils'
import type { Episode, WatchProgress } from '../../types'

interface EpisodeItemProps {
  episode: Episode
  isOwned?: boolean
  isFreeEpisode?: boolean
  progress?: WatchProgress | null
  onPlay?: (episode: Episode) => void
  onPurchase?: (episode: Episode) => void
  isActive?: boolean
}

const FALLBACK_THUMB = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="56" viewBox="0 0 96 56"%3E%3Crect width="96" height="56" fill="%231a1a24"/%3E%3Ctext x="48" y="33" text-anchor="middle" fill="%23ffffff20" font-size="20"%3E▶%3C/text%3E%3C/svg%3E'

export const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
  isOwned,
  isFreeEpisode,
  progress,
  onPlay,
  onPurchase,
  isActive,
}) => {
  const canWatch = isOwned || episode.isFree || isFreeEpisode
  const isCompleted = progress?.completed
  const progressPercent = progress ? Math.min(progress.percentage, 100) : 0

  const handleClick = () => {
    if (canWatch) {
      onPlay?.(episode)
    } else {
      onPurchase?.(episode)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200',
        'bg-[#1a1a24] hover:bg-[#252535] border',
        isActive ? 'border-[#d4af37]/50 bg-[#d4af37]/5' : 'border-white/5',
        !canWatch && 'opacity-80'
      )}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#12121a]">
        <img
          src={episode.thumbnailUrl || FALLBACK_THUMB}
          alt={episode.titleKh || episode.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = FALLBACK_THUMB
          }}
          loading="lazy"
        />

        {/* Progress overlay */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/50">
            <div
              className="h-full bg-[#d4af37]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Play/Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {canWatch ? (
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                isActive
                  ? 'bg-[#d4af37]'
                  : 'bg-black/50 backdrop-blur-sm group-hover:bg-[#d4af37]/80'
              )}
            >
              <Play size={14} fill={isActive ? '#0a0a0f' : 'white'} className={isActive ? 'text-[#0a0a0f] ml-0.5' : 'text-white ml-0.5'} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Lock size={14} className="text-[#d4af37]" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold font-khmer truncate">
              ភាគទី {episode.episodeNumber}: {episode.titleKh || episode.title}
            </p>
            {episode.duration && (
              <p className="text-white/40 text-[10px] mt-0.5">
                {formatDuration(episode.duration)}
              </p>
            )}
            {progress && progressPercent > 0 && !isCompleted && (
              <p className="text-[#d4af37] text-[10px] mt-0.5 font-khmer">
                {Math.round(progressPercent)}% — បន្តមើល
              </p>
            )}
          </div>

          {/* Status icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isCompleted ? (
              <CheckCircle size={16} className="text-emerald-400" />
            ) : episode.isFree ? (
              <span className="text-emerald-400 text-[9px] font-bold uppercase border border-emerald-500/40 bg-emerald-500/10 rounded px-1 py-0.5">FREE</span>
            ) : !canWatch ? (
              <Lock size={14} className="text-[#d4af37]" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EpisodeItem
