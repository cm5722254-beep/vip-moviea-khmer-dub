import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { Category } from '../types'

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const response = await api.get<Category[]>('/categories')
      return response.data
    },
    staleTime: 1000 * 60 * 15, // categories rarely change
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Category>(`/categories/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
