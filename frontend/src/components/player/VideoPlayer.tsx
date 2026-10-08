import React, { useRef, useState, useCallback, useEffect } from 'react'
import ReactPlayer from 'react-player'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, ChevronUp, ChevronDown
} from 'lucide-react'
import { cn, formatDuration } from '../../lib/utils'
import { useSaveProgress } from '../../hooks/useWatchProgress'
import type { Episode } from '../../types'

interface VideoPlayerProps {
  episode: Episode
  movieId: string
  startTime?: number
  onEnded?: () => void
  onNextEpisode?: () => void
  onPrevEpisode?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  episodes?: Episode[]
  onEpisodeSelect?: (episode: Episode) => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  movieId,
  startTime = 0,
  onEnded,
  onNextEpisode,
  onPrevEpisode,
  hasNext,
  hasPrev,
  episodes,
  onEpisodeSelect,
}) => {
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [started, setStarted] = useState(false)

  const { saveProgress } = useSaveProgress()

  // Auto hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }, [playing])

  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [resetControlsTimer])

  // Seek to start position once ready
  const handleReady = () => {
    if (startTime > 0 && !started) {
      playerRef.current?.seekTo(startTime, 'seconds')
      setStarted(true)
    }
  }

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number }) => {
    if (!seeking) {
      setPlayed(state.played)
      setLoaded(state.loaded)
    }
    // Save progress every ~10s of play
    if (duration > 0 && state.playedSeconds > 0) {
      saveProgress({
        episodeId: episode.id,
        movieId,
        currentTime: state.playedSeconds,
        duration,
      })
    }
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value))
  }

  const handleSeekMouseDown = () => setSeeking(true)

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false)
    playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value))
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const skip = (seconds: number) => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(current + seconds, 'seconds')
  }

  const currentTime = played * duration

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black select-none',
        fullscreen ? 'w-screen h-screen' : 'w-full aspect-video'
      )}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={() => {
        if (!showControls) {
          resetControlsTimer()
        }
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={episode.videoUrl || ''}
        playing={playing}
        muted={muted}
        volume={volume}
        width="100%"
        height="100%"
        onReady={handleReady}
        onProgress={handleProgress}
        onDuration={setDuration}
        onEnded={onEnded}
        config={{
          file: {
            attributes: { crossOrigin: 'anonymous' },
            tracks: episode.subtitles?.map((sub) => ({
              kind: 'subtitles',
              src: sub.url,
              srcLang: sub.languageCode,
              label: sub.language,
              default: sub.languageCode === 'km',
            })) || [],
          },
        }}
      />

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <p className="text-white text-sm font-semibold font-khmer drop-shadow truncate max-w-[70%]">
            ភាគទី {episode.episodeNumber}: {episode.titleKh || episode.title}
          </p>
          {episodes && episodes.length > 1 && (
            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="flex items-center gap-1 text-white/80 text-xs bg-black/40 rounded-lg px-2 py-1"
            >
              ភាគ {showEpisodes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Episode list dropdown */}
        {showEpisodes && episodes && (
          <div className="absolute top-12 right-4 w-52 max-h-60 overflow-y-auto bg-[#0a0a0f]/95 backdrop-blur-lg border border-white/10 rounded-xl">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  onEpisodeSelect?.(ep)
                  setShowEpisodes(false)
                }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-xs font-khmer transition-colors',
                  ep.id === episode.id
                    ? 'text-[#d4af37] bg-[#d4af37]/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                ភាគទី {ep.episodeNumber}: {ep.titleKh || ep.title}
              </button>
            ))}
          </div>
        )}

        {/* Center controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-none">
          <button
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-black/40"
            onClick={() => skip(-10)}
          >
            <SkipBack size={18} className="text-white" />
          </button>
          <button
            className="pointer-events-auto w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            onClick={() => setPlaying(!playing)}
          >
            {playing ? (
              <Pause size={26} className="text-white" />
            ) : (
              <Play size={26} className="text-white ml-1" />
            )}
          </button>
          <button
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-black/40"
            onClick={() => skip(10)}
          >
            <SkipForward size={18} className="text-white" />
          </button>
        </div>

        {/* Bottom controls */}
        <div className="px-4 pb-4 space-y-2">
          {/* Progress bar */}
          <div className="relative flex items-center gap-2">
            <span className="text-white/60 text-[10px] w-10 text-right tabular-nums">
              {formatDuration(currentTime)}
            </span>
            <div className="flex-1 relative h-1 group">
              {/* Buffered */}
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
                style={{ width: `${loaded * 100}%` }}
              />
              {/* Progress */}
              <div
                className="absolute inset-y-0 left-0 bg-[#d4af37] rounded-full"
                style={{ width: `${played * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
              />
            </div>
            <span className="text-white/60 text-[10px] w-10 tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasPrev && (
                <button onClick={onPrevEpisode} className="text-white/60 hover:text-white">
                  <SkipBack size={18} />
                </button>
              )}
              <button onClick={() => setMuted(!muted)} className="text-white/70 hover:text-white">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  setMuted(false)
                }}
                className="w-16 h-1 accent-[#d4af37]"
              />
              {hasNext && (
                <button onClick={onNextEpisode} className="text-white/60 hover:text-white">
                  <SkipForward size={18} />
                </button>
              )}
            </div>
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white">
              {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
