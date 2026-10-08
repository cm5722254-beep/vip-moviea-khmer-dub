import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import type { Wallet, Transaction, Deposit, DepositMethod, PaginatedResponse } from '../types'

export const walletKeys = {
  all: ['wallet'] as const,
  wallet: () => [...walletKeys.all, 'balance'] as const,
  transactions: (page?: number) => [...walletKeys.all, 'transactions', page] as const,
  deposits: () => [...walletKeys.all, 'deposits'] as const,
}

export function useWallet() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: walletKeys.wallet(),
    queryFn: async () => {
      const response = await api.get<Wallet>('/wallet')
      return response.data
    },
    enabled: isAuthenticated,
  })
}

export function useTransactions(page = 1, limit = 20) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: walletKeys.transactions(page),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Transaction>>('/wallet/transactions', {
        params: { page, limit },
      })
      return response.data
    },
    enabled: isAuthenticated,
  })
}

interface DepositPayload {
  method: DepositMethod
  amount: number
  note?: string
}

export function useDeposit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DepositPayload) => {
      const response = await api.post<Deposit>('/wallet/deposit', payload)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.wallet() })
      qc.invalidateQueries({ queryKey: walletKeys.transactions() })
    },
  })
}

export function useMyDeposits() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: walletKeys.deposits(),
    queryFn: async () => {
      const response = await api.get<Deposit[]>('/wallet/deposits')
      return response.data
    },
    enabled: isAuthenticated,
  })
}
