import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { Movie, Episode, SearchResult } from '../types'

// ============================================================
// Helper: map raw backend movie fields to frontend aliases
// ============================================================
function mapMovie(movie: Movie): Movie {
  return {
    ...movie,
    title: movie.titleKh || movie.titleEn || '',
    description: movie.descriptionKh || movie.descriptionEn,
    rating: movie.averageRating,
    episodesCount: movie.totalEpisodes,
    isPopular: !!(movie.isHot ?? movie.isPopular),
    isPublished: movie.status === 'PUBLISHED',
    year: movie.releaseYear,
  }
}

// ============================================================
// Query keys
// ============================================================
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...movieKeys.lists(), filters] as const,
  detail: (id: string) => [...movieKeys.all, 'detail', id] as const,
  episodes: (movieId: string) => [...movieKeys.all, 'episodes', movieId] as const,
  popular: () => [...movieKeys.all, 'popular'] as const,
  newMovies: () => [...movieKeys.all, 'new'] as const,
  featured: () => [...movieKeys.all, 'featured'] as const,
  search: (q: string) => [...movieKeys.all, 'search', q] as const,
}

// ============================================================
// Backend paginated response shape: { items: T[], meta: {...} }
// We normalise it to a flat object that consumers can use.
// ============================================================
interface BackendPage<T> {
  items: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Fallback shape when the Axios interceptor has already unwrapped the envelope
interface UnwrappedPage<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface MappedPage<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function mapPage<T>(raw: BackendPage<T>): MappedPage<T> {
  return {
    data: raw.items,
    total: raw.meta.total,
    page: raw.meta.page,
    limit: raw.meta.limit,
    totalPages: raw.meta.totalPages,
  }
}

// ============================================================
// Hooks
// ============================================================

export function useMovies(params?: { page?: number; limit?: number; categoryId?: string }) {
  return useQuery({
    queryKey: movieKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.get<UnwrappedPage<Movie>>('/movies', { params })
      const page = response.data
      return { ...page, data: page.data.map(mapMovie) }
    },
    enabled: true,
  })
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Movie>(`/movies/${id}`)
      return mapMovie(response.data)
    },
    enabled: !!id,
  })
}

export function useMovieEpisodes(movieId: string) {
  return useQuery({
    queryKey: movieKeys.episodes(movieId),
    queryFn: async () => {
      const response = await api.get<Episode[]>(`/movies/${movieId}/episodes`)
      return response.data
    },
    enabled: !!movieId,
  })
}

// These endpoints return a plain array — no pagination wrapper
export function usePopular(limit = 10) {
  return useQuery({
    queryKey: [...movieKeys.popular(), limit],
    queryFn: async () => {
      const response = await api.get<Movie[]>('/movies/popular', { params: { limit } })
      const arr = Array.isArray(response.data)
        ? response.data
        : (response.data as unknown as { data: Movie[] }).data ?? []
      return arr.map(mapMovie)
    },
  })
}

export function useNew(limit = 10) {
  return useQuery({
    queryKey: [...movieKeys.newMovies(), limit],
    queryFn: async () => {
      const response = await api.get<Movie[]>('/movies/new', { params: { limit } })
      const arr = Array.isArray(response.data)
        ? response.data
        : (response.data as unknown as { data: Movie[] }).data ?? []
      return arr.map(mapMovie)
    },
  })
}

export function useFeatured() {
  return useQuery({
    queryKey: movieKeys.featured(),
    queryFn: async () => {
      const response = await api.get<Movie[]>('/movies/featured')
      const arr = Array.isArray(response.data)
        ? response.data
        : (response.data as unknown as { data: Movie[] }).data ?? []
      return arr.map(mapMovie)
    },
  })
}

// Backend search response: { items: Movie[], query: string, meta: {...} }
interface BackendSearchResponse {
  items: Movie[]
  query: string
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: movieKeys.search(query),
    queryFn: async () => {
      const response = await api.get<BackendSearchResponse>('/movies/search', {
        params: { q: query },
      })
      const result: SearchResult = {
        movies: response.data.items.map(mapMovie),
        total: response.data.meta.total,
        query: response.data.query,
      }
      return result
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

export function useInfiniteMovies(params?: { categoryId?: string; limit?: number }) {
  return useInfiniteQuery({
    queryKey: [...movieKeys.lists(), 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<BackendPage<Movie>>('/movies', {
        params: { ...params, page: pageParam, limit: params?.limit || 12 },
      })
      const mapped = mapPage(response.data)
      return { ...mapped, data: mapped.data.map(mapMovie) }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1
      return undefined
    },
    initialPageParam: 1,
  })
}

/**
 * Fetches a presigned streaming URL for an episode from the VideoAsset table.
 * URLs expire in ~60 minutes; we cache for 50 min (staleTime) / 55 min (gcTime).
 *
 * @param movieId   - Parent movie ID
 * @param episodeId - The episode to stream
 * @param enabled   - Set to false to skip fetching (e.g. user hasn't purchased yet)
 */
export function useEpisodeWatchUrl(movieId: string, episodeId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['watch-url', movieId, episodeId],
    queryFn: async () => {
      const response = await api.get<{ url: string; expiresIn: number }>(
        `/movies/${movieId}/episodes/${episodeId}/watch`
      )
      return response.data
    },
    enabled: enabled && !!movieId && !!episodeId,
    staleTime: 1000 * 60 * 50, // 50 min (URLs expire in 60 min)
    gcTime: 1000 * 60 * 55,
  })
}
