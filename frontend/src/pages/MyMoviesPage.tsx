import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, ShoppingBag, History } from 'lucide-react'
import { useMyPurchases } from '../hooks/usePurchases'
import { useAllWatchProgress } from '../hooks/useWatchProgress'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDate } from '../lib/utils'

type TabType = 'continue' | 'purchased' | 'history'

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'continue', label: 'មើលបន្ត', icon: <Play size={14} /> },
  { id: 'purchased', label: 'បានទិញ', icon: <ShoppingBag size={14} /> },
  { id: 'history', label: 'ប្រវត្តិ', icon: <History size={14} /> },
]

const FALLBACK_POSTER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='80' viewBox='0 0 60 80'%3E%3Crect width='60' height='80' fill='%231a1a24'/%3E%3Ctext x='30' y='45' text-anchor='middle' fill='%23ffffff20' font-size='24'%3E🎬%3C/text%3E%3C/svg%3E`

export const MyMoviesPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('continue')

  const { data: purchases, isLoading: loadingPurchases } = useMyPurchases()
  const { data: progress, isLoading: loadingProgress } = useAllWatchProgress()

  const inProgress = progress
    ?.filter((p) => !p.completed && p.percentage > 2)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())

  const completed = progress?.filter((p) => p.completed) || []

  const moviePurchases = purchases?.filter((p) => p.type === 'movie') || []

  const isLoading = loadingPurchases || loadingProgress

  return (
    <div className="page-container">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 pt-4 pb-0">
          <h1 className="text-white text-xl font-bold font-khmer mb-3">
            រឿងរបស់ខ្ញុំ
          </h1>
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-khmer font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#1a1a24] text-[#d4af37] border-b-2 border-[#d4af37]'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 px-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 bg-[#1a1a24] rounded-xl">
                <Skeleton className="w-16 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Continue Watching Tab */}
            {activeTab === 'continue' && (
              <>
                {!inProgress || inProgress.length === 0 ? (
                  <EmptyState
                    type="movies"
                    title="គ្មានរឿងក្នុងការមើល"
                    description="ចាប់ផ្តើមមើលរឿងណាមួយ ហើយវានឹងបង្ហាញនៅទីនេះ"
                    action={
                      <Button variant="gold" onClick={() => navigate('/')}>
                        ស្វែងរករឿង
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {inProgress.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 bg-[#1a1a24] rounded-xl border border-white/5 cursor-pointer hover:border-[#d4af37]/20 transition-colors"
                        onClick={() => navigate(`/watch/${item.movieId}/${item.episodeId}`)}
                      >
                        <img
                          src={item.episode?.thumbnailUrl || item.movie?.posterUrl || FALLBACK_POSTER}
                          alt={item.movie?.titleKh}
                          className="w-16 h-20 rounded-lg object-cover flex-shrink-0 bg-[#12121a]"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = FALLBACK_POSTER
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold font-khmer truncate">
                            {item.movie?.titleKh || item.movie?.title}
                          </p>
                          <p className="text-white/40 text-xs font-khmer mt-0.5">
                            ភាគ {item.episode?.episodeNumber}: {item.episode?.titleKh || item.episode?.title}
                          </p>

                          {/* Progress bar */}
                          <div className="mt-2">
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#d4af37] rounded-full transition-all"
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              />
                            </div>
                            <p className="text-[#d4af37] text-[10px] mt-1 font-khmer">
                              {Math.round(item.percentage)}% — {formatDate(item.lastWatchedAt)}
                            </p>
                          </div>

                          <button className="mt-2 flex items-center gap-1 bg-[#d4af37]/10 text-[#d4af37] rounded-lg px-2 py-1 text-[10px] font-khmer font-semibold">
                            <Play size={10} fill="#d4af37" />
                            បន្តមើល
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Purchased Tab */}
            {activeTab === 'purchased' && (
              <>
                {moviePurchases.length === 0 ? (
                  <EmptyState
                    type="purchases"
                    action={
                      <Button variant="gold" onClick={() => navigate('/')}>
                        ទិញរឿង
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {moviePurchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex gap-3 p-3 bg-[#1a1a24] rounded-xl border border-white/5 cursor-pointer hover:border-[#d4af37]/20 transition-colors"
                        onClick={() => purchase.movieId && navigate(`/movies/${purchase.movieId}`)}
                      >
                        <img
                          src={purchase.movie?.posterUrl || FALLBACK_POSTER}
                          alt={purchase.movie?.titleKh}
                          className="w-12 h-16 rounded-lg object-cover flex-shrink-0 bg-[#12121a]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold font-khmer truncate">
                            {purchase.movie?.titleKh || purchase.movie?.title}
                          </p>
                          <p className="text-white/40 text-xs font-khmer mt-0.5">
                            {purchase.movie?.episodesCount} ភាគ
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[#d4af37] text-xs font-bold">
                              ${purchase.amount.toFixed(2)}
                            </span>
                            <span className="text-white/30 text-[10px]">
                              {formatDate(purchase.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <>
                {completed.length === 0 ? (
                  <EmptyState
                    type="movies"
                    title="គ្មានប្រវត្តិ"
                    description="រឿងដែលអ្នកបានមើលចប់ នឹងបង្ហាញនៅទីនេះ"
                  />
                ) : (
                  <div className="space-y-3">
                    {completed.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 bg-[#1a1a24] rounded-xl border border-white/5 cursor-pointer"
                        onClick={() => navigate(`/movies/${item.movieId}`)}
                      >
                        <img
                          src={item.movie?.posterUrl || FALLBACK_POSTER}
                          alt=""
                          className="w-12 h-16 rounded-lg object-cover flex-shrink-0 bg-[#12121a]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold font-khmer truncate">
                            {item.movie?.titleKh || item.movie?.title}
                          </p>
                          <p className="text-white/40 text-xs font-khmer mt-0.5">
                            ភាគ {item.episode?.episodeNumber} — ចប់
                          </p>
                          <p className="text-emerald-400 text-[10px] mt-1 font-khmer">
                            ✓ មើលចប់ • {formatDate(item.lastWatchedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyMoviesPage
