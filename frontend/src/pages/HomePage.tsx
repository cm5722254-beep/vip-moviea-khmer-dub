import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, ChevronRight, Star } from 'lucide-react'
import { usePopular, useNew, useFeatured } from '../hooks/useMovies'
import { useCategories } from '../hooks/useCategories'
import { useWallet } from '../hooks/useWallet'
import { useAuthStore } from '../stores/authStore'
import { useAllWatchProgress } from '../hooks/useWatchProgress'
import MovieRow from '../components/movies/MovieRow'
import MovieCard from '../components/movies/MovieCard'
import { Skeleton } from '../components/ui/Skeleton'
import { getTelegramUser } from '../lib/telegram'
import { formatCurrency } from '../lib/utils'

const FALLBACK_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='%231a1a24'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='%23d4af37' font-size='18'%3E👤%3C/text%3E%3C/svg%3E`

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const tgUser = getTelegramUser()
  const { data: wallet } = useWallet()
  const { data: popular, isLoading: loadingPopular } = usePopular(12)
  const { data: newMovies, isLoading: loadingNew } = useNew(12)
  const { data: featured, isLoading: loadingFeatured } = useFeatured()
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: progress } = useAllWatchProgress()

  const displayName = user?.firstName || tgUser?.first_name || 'ភ្ញៀវ'
  const balance = wallet?.balance ?? user?.balance ?? 0
  const photoUrl = user?.photoUrl || tgUser?.photo_url || FALLBACK_AVATAR

  const continueWatching = progress
    ?.filter((p) => !p.completed && p.percentage > 0 && p.percentage < 95)
    .slice(0, 10)

  return (
    <div className="page-container">
      {/* Hero/Header */}
      <div className="relative px-4 pt-4 pb-6 bg-gradient-to-b from-[#12121a] to-[#0a0a0f]">
        <div className="flex items-center justify-between mb-5">
          {/* Logo */}
          <div>
            <h1 className="text-[#d4af37] font-bold text-xl font-khmer tracking-wide">
              អាធិរាជរឿង
            </h1>
            <p className="text-white/30 text-xs font-khmer mt-0.5">
              ស្វាគមន៍ 👋 {displayName}
            </p>
          </div>

          {/* Avatar + Balance */}
          <div className="flex items-center gap-3">
            {/* Balance chip */}
            <button
              onClick={() => navigate('/wallet')}
              className="flex items-center gap-1.5 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full px-3 py-1.5"
            >
              <Wallet size={13} className="text-[#d4af37]" />
              <span className="text-[#d4af37] text-xs font-bold">
                {formatCurrency(balance)}
              </span>
            </button>

            {/* Avatar */}
            <button onClick={() => navigate('/profile')}>
              <img
                src={photoUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]/30"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = FALLBACK_AVATAR
                }}
              />
            </button>
          </div>
        </div>

        {/* Featured banner — first featured movie */}
        {loadingFeatured ? (
          <Skeleton className="w-full h-44 rounded-2xl" />
        ) : featured && featured[0] ? (
          <button
            className="relative w-full h-44 rounded-2xl overflow-hidden group"
            onClick={() => navigate(`/movies/${featured[0].id}`)}
          >
            <img
              src={featured[0].bannerUrl || featured[0].posterUrl || ''}
              alt={featured[0].titleKh}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-left">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Star size={12} fill="#d4af37" className="text-[#d4af37]" />
                <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">
                  ពិសេស
                </span>
              </div>
              <h2 className="text-white font-bold text-lg font-khmer leading-snug max-w-[60%]">
                {featured[0].titleKh || featured[0].title}
              </h2>
              {featured[0].episodesCount && (
                <p className="text-white/60 text-xs font-khmer mt-1">
                  {featured[0].episodesCount} ភាគ
                </p>
              )}
            </div>
            <div className="absolute bottom-4 right-4 bg-[#d4af37] rounded-full px-3 py-1">
              <span className="text-[#0a0a0f] text-xs font-bold font-khmer">
                {featured[0].isFree ? 'ឥតគិតថ្លៃ' : `$${featured[0].price.toFixed(2)}`}
              </span>
            </div>
          </button>
        ) : null}
      </div>

      {/* Continue Watching */}
      {continueWatching && continueWatching.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-white font-semibold text-base font-khmer flex items-center gap-2">
              <span className="w-1 h-5 bg-[#d4af37] rounded-full" />
              មើលបន្ត
            </h2>
          </div>
          <div className="flex gap-3 pl-4 overflow-x-auto scrollbar-hide pb-1">
            {continueWatching.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/watch/${item.movieId}/${item.episodeId}`)}
                className="flex-shrink-0 w-48 bg-[#1a1a24] rounded-xl overflow-hidden border border-white/5"
              >
                {item.episode?.thumbnailUrl && (
                  <div className="relative h-24">
                    <img
                      src={item.episode.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div
                        className="h-full bg-[#d4af37]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-white text-xs font-semibold font-khmer truncate">
                    {item.movie?.titleKh || item.movie?.title}
                  </p>
                  <p className="text-white/40 text-[10px] font-khmer mt-0.5">
                    ភាគ {item.episode?.episodeNumber} • {Math.round(item.percentage)}%
                  </p>
                </div>
              </button>
            ))}
            <div className="w-4 flex-shrink-0" />
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mb-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-base font-khmer flex items-center gap-2">
            <span className="w-1 h-5 bg-[#d4af37] rounded-full" />
            ប្រភេទ
          </h2>
        </div>
        {loadingCategories ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {categories?.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="flex flex-col items-center justify-center h-16 bg-[#1a1a24] rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-colors"
              >
                {cat.icon ? (
                  <span className="text-2xl mb-1">{cat.icon}</span>
                ) : (
                  <span className="text-[#d4af37] text-xl mb-1">🎬</span>
                )}
                <span className="text-white/70 text-[9px] font-khmer text-center leading-tight px-1">
                  {cat.nameKh || cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Movie rows */}
      <MovieRow
        title="ពេញនិយម 🔥"
        movies={popular}
        isLoading={loadingPopular}
        viewAllLink="/search?sort=popular"
      />

      <MovieRow
        title="ថ្មីៗ ✨"
        movies={newMovies}
        isLoading={loadingNew}
        viewAllLink="/search?sort=new"
      />

      {/* Featured grid */}
      {loadingFeatured ? (
        <section className="mb-6 px-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </section>
      ) : featured && featured.length > 1 ? (
        <section className="mb-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-base font-khmer flex items-center gap-2">
              <span className="w-1 h-5 bg-[#d4af37] rounded-full" />
              ពិសេស ⭐
            </h2>
            <button
              onClick={() => navigate('/search?featured=true')}
              className="flex items-center gap-0.5 text-[#d4af37] text-xs font-khmer"
            >
              មើលទាំងអស់ <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featured.slice(1, 5).map((movie) => (
              <MovieCard key={movie.id} movie={movie} size="lg" className="w-full" />
            ))}
          </div>
        </section>
      ) : null}

      {/* Spacer for bottom nav */}
      <div className="h-4" />
    </div>
  )
}

export default HomePage
