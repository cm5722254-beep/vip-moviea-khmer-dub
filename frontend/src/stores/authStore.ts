import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false })
      },

      updateUser: (partial: Partial<User>) => {
        const current = get().user
        if (current) {
          set({ user: { ...current, ...partial } })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      // Only persist token and user; derive isAuthenticated on rehydrate
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Admin auth store
interface AdminAuthState {
  token: string | null
  admin: { id: string; username: string; role: string } | null
  isAuthenticated: boolean
  login: (token: string, admin: { id: string; username: string; role: string }) => void
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: (token, admin) => {
        set({ token, admin, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, admin: null, isAuthenticated: false })
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)
