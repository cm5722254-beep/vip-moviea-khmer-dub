import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — inject auth token from Zustand store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lazy import to avoid circular dependency
    try {
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        const token: string | undefined = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // ignore parse errors
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 and extract error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to root
      try {
        localStorage.removeItem('auth-storage')
      } catch {
        // ignore
      }
      window.location.href = '/'
    }
    return Promise.reject(extractApiError(error))
  }
)

export function extractApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (data) {
      const msg =
        (data.messageKh as string) ||
        (data.message as string) ||
        (Array.isArray(data.errors) ? (data.errors as string[]).join(', ') : null) ||
        'Something went wrong'
      return new Error(msg)
    }
    if (error.message === 'Network Error') {
      return new Error('មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេ')
    }
    if (error.code === 'ECONNABORTED') {
      return new Error('ការស្នើសុំចំណាយពេលយូរពេក')
    }
  }
  if (error instanceof Error) return error
  return new Error('មានបញ្ហាមួយ')
}

// Admin API instance — separate base URL / token key
export const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

adminApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const raw = localStorage.getItem('admin-auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        const token: string | undefined = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // ignore
    }
    return config
  },
  (error) => Promise.reject(error)
)

adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('admin-auth-storage')
      } catch {
        // ignore
      }
      window.location.href = '/admin'
    }
    return Promise.reject(extractApiError(error))
  }
)

export default api
