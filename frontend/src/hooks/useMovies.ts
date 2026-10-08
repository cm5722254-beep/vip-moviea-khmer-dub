import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { Movie, Episode, PaginatedResponse, SearchResult } from '../types'

// Query keys
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

export function useMovies(params?: { page?: number; limit?: number; categoryId?: string }) {
  return useQuery({
    queryKey: movieKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Movie>>('/movies', { params })
      return response.data
    },
    enabled: true,
  })
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Movie>(`/movies/${id}`)
      return response.data
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

export function usePopular(limit = 10) {
  return useQuery({
    queryKey: [...movieKeys.popular(), limit],
    queryFn: async () => {
      const response = await api.get<Movie[]>('/movies/popular', { params: { limit } })
      return response.data
    },
  })
}

export function useNew(limit = 10) {
  return useQuery({
    queryKey: [...movieKeys.newMovies(), limit],
    queryFn: async () => {
      const response = await api.get<Movie[]>('/movies/new', { params: { limit } })
      return response.data
    },
  })
}

export function useFeatured() {
  return useQuery({
    queryKey: movieKeys.featured(),
    queryFn: async () => {
      const response = await api.get<Movie[]>('/movies/featured')
      return response.data
    },
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: movieKeys.search(query),
    queryFn: async () => {
      const response = await api.get<SearchResult>('/movies/search', {
        params: { q: query },
      })
      return response.data
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

export function useInfiniteMovies(params?: { categoryId?: string; limit?: number }) {
  return useInfiniteQuery({
    queryKey: [...movieKeys.lists(), 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<PaginatedResponse<Movie>>('/movies', {
        params: { ...params, page: pageParam, limit: params?.limit || 12 },
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1
      return undefined
    },
    initialPageParam: 1,
  })
}
