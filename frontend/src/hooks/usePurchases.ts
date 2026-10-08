import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { walletKeys } from './useWallet'
import type { Purchase } from '../types'

export const purchaseKeys = {
  all: ['purchases'] as const,
  mine: () => [...purchaseKeys.all, 'mine'] as const,
  check: (type: string, id: string) => [...purchaseKeys.all, 'check', type, id] as const,
}

export function useMyPurchases() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: purchaseKeys.mine(),
    queryFn: async () => {
      const response = await api.get<Purchase[]>('/purchases/my')
      return response.data
    },
    enabled: isAuthenticated,
  })
}

export function useCheckOwnership(type: 'movie' | 'episode', id: string) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: purchaseKeys.check(type, id),
    queryFn: async () => {
      const response = await api.get<{ owned: boolean }>(`/purchases/check/${type}/${id}`)
      return response.data
    },
    enabled: isAuthenticated && !!id,
  })
}

interface PurchasePayload {
  type: 'movie' | 'episode'
  id: string
}

export function usePurchase() {
  const qc = useQueryClient()
  const { updateUser } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: PurchasePayload) => {
      const response = await api.post<{ purchase: Purchase; newBalance: number }>(
        '/purchases',
        payload
      )
      return response.data
    },
    onSuccess: (data) => {
      // Update user balance
      updateUser({ balance: data.newBalance })
      // Invalidate related queries
      qc.invalidateQueries({ queryKey: purchaseKeys.all })
      qc.invalidateQueries({ queryKey: walletKeys.wallet() })
      qc.invalidateQueries({ queryKey: walletKeys.transactions() })
    },
  })
}
