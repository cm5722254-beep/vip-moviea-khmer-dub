import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import type { WatchProgress } from '../types'

export const progressKeys = {
  all: ['watch-progress'] as const,
  mine: () => [...progressKeys.all, 'mine'] as const,
  episode: (episodeId: string) => [...progressKeys.all, 'episode', episodeId] as const,
  movie: (movieId: string) => [...progressKeys.all, 'movie', movieId] as const,
}

export function useWatchProgress(episodeId: string) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: progressKeys.episode(episodeId),
    queryFn: async () => {
      const response = await api.get<WatchProgress | null>(`/watch-progress/${episodeId}`)
      return response.data
    },
    enabled: isAuthenticated && !!episodeId,
  })
}

export function useAllWatchProgress() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: progressKeys.mine(),
    queryFn: async () => {
      const response = await api.get<WatchProgress[]>('/watch-progress')
      return response.data
    },
    enabled: isAuthenticated,
  })
}

export function useMovieWatchProgress(movieId: string) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: progressKeys.movie(movieId),
    queryFn: async () => {
      const response = await api.get<WatchProgress[]>(`/watch-progress/movie/${movieId}`)
      return response.data
    },
    enabled: isAuthenticated && !!movieId,
  })
}

interface SaveProgressPayload {
  episodeId: string
  movieId: string
  currentTime: number
  duration: number
}

export function useSaveProgress() {
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: async (payload: SaveProgressPayload) => {
      const response = await api.post<WatchProgress>('/watch-progress', payload)
      return response.data
    },
    onSuccess: (data) => {
      qc.setQueryData(progressKeys.episode(data.episodeId), data)
    },
  })

  // Debounced save — only fires 3s after last call
  const saveProgress = useCallback(
    (payload: SaveProgressPayload) => {
      if (!isAuthenticated) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        mutation.mutate(payload)
      }, 3000)
    },
    [isAuthenticated, mutation]
  )

  return { saveProgress, mutation }
}
