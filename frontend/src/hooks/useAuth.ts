import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'
import { getTelegramInitData } from '../lib/telegram'
import { useAuthStore } from '../stores/authStore'
import type { AuthResponse } from '../types'

interface AuthPayload {
  initData: string
}

export function useAuth() {
  const { login, logout, user, isAuthenticated, token } = useAuthStore()

  const authMutation = useMutation({
    mutationFn: async (payload?: AuthPayload) => {
      const initData = payload?.initData || getTelegramInitData()
      const response = await api.post<AuthResponse>('/auth/telegram', { initData })
      return response.data
    },
    onSuccess: (data) => {
      login(data.token, data.user)
    },
  })

  const authenticate = () => {
    const initData = getTelegramInitData()
    if (!initData && import.meta.env.DEV) {
      // Dev mode: use mock auth
      return authMutation.mutateAsync({ initData: 'mock_dev_data' })
    }
    return authMutation.mutateAsync({ initData })
  }

  return {
    authenticate,
    authMutation,
    user,
    isAuthenticated,
    token,
    logout,
    isLoading: authMutation.isPending,
    error: authMutation.error,
  }
}
