import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, TrendingUp } from 'lucide-react'
import { useSearch, useMovies } from '../hooks/useMovies'
import { useCategories } from '../hooks/useCategories'
import MovieGrid from '../components/movies/MovieGrid'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { hapticFeedback } from '../lib/telegram'

const POPULAR_SEARCHES = [
  'ចក្រភព', 'ស្នេហ៍', 'ភ័យរន្ធត់', 'សកម្មភាព', 'អនុស្សាវរីយ៍',
  'បន្ទប់ស្ទួន', 'រឿងចិន', 'រឿងថៃ', 'រឿងខ្មែរ', 'ការស៊ើបអង្កេត',
]

export const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const categoryId = searchParams.get('category') || undefined

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searchResults, isLoading: isSearching } = useSearch(debouncedQuery)
  const { data: allMovies, isLoading: loadingAll } = useMovies({ categoryId })
  const { data: categories } = useCategories()

  const handleClear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])

  const handlePopularSearch = (term: string) => {
    hapticFeedback('light')
    setQuery(term)
  }

  const showingSearch = debouncedQuery.trim().length > 0
  const movies = showingSearch ? searchResults?.movies : allMovies?.data

  return (
    <div className="page-container">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរករឿង..."
            autoFocus={false}
            className="w-full bg-[#1a1a24] border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-white placeholder:text-white/30 text-sm font-khmer focus:outline-none focus:border-[#d4af37]/40 transition-colors"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category filter */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => navigate('/search')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-khmer transition-colors ${
                !categoryId
                  ? 'bg-[#d4af37] text-[#0a0a0f] font-semibold'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              ទាំងអស់
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-khmer transition-colors ${
                  categoryId === cat.id
                    ? 'bg-[#d4af37] text-[#0a0a0f] font-semibold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {cat.nameKh || cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4">
        {/* No query — show popular searches */}
        {!showingSearch && !categoryId && (
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#d4af37]" />
              <h3 className="text-white font-semibold text-sm font-khmer">ការស្វែងរកពេញនិយម</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularSearch(term)}
                  className="px-3 py-1.5 bg-[#1a1a24] border border-white/10 rounded-full text-white/70 text-xs font-khmer hover:border-[#d4af37]/40 hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results count */}
        {showingSearch && !isSearching && searchResults && (
          <div className="px-4 mb-3">
            <p className="text-white/40 text-xs font-khmer">
              រកឃើញ {searchResults.total} រឿង សម្រាប់ «{searchResults.query}»
            </p>
          </div>
        )}

        {/* Loading state */}
        {(isSearching || loadingAll) && (
          <div className="grid grid-cols-3 gap-3 px-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="w-full aspect-[2/3] rounded-xl mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!isSearching && !loadingAll && (
          <>
            {movies && movies.length > 0 ? (
              <MovieGrid movies={movies} />
            ) : (
              <EmptyState
                type="search"
                title={showingSearch ? `រកមិនឃើញ «${query}»` : 'មិនមានរឿង'}
                description={
                  showingSearch
                    ? 'សូមពិនិត្យអក្ខរាវិរុទ្ធ ឬសាកល្បងពាក្យផ្សេង'
                    : 'ជ្រើសរើសប្រភេទ ឬស្វែងរករឿង'
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
