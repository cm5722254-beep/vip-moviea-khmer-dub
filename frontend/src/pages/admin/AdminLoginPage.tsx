import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { useAdminAuthStore } from '../../stores/authStore'
import Button from '../../components/ui/Button'
import type { AdminAuthResponse } from '../../types'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAdminAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await adminApi.post<AdminAuthResponse>('/admin/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      login(data.token, data.admin)
      navigate('/admin/dashboard')
    },
    onError: () => {
      setAttempts((a) => a + 1)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    loginMutation.mutate({ username: username.trim(), password })
  }

  const isRateLimited = attempts >= 5
  const errorMessage = loginMutation.error instanceof Error ? loginMutation.error.message : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-[#d4af37]" />
          </div>
          <h1 className="text-white text-2xl font-bold">Admin Panel</h1>
          <p className="text-white/40 text-sm font-khmer mt-1">អាធិរាជរឿង</p>
        </div>

        {/* Rate limit warning */}
        {isRateLimited && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm font-khmer">
              ព្យាយាមច្រើនដង — សូម​ ទំ​នាក់​ទំ​នង Admin
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/50 text-xs mb-1.5 font-khmer">
              Username / ឈ្មោះអ្នកប្រើ
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={isRateLimited || loginMutation.isPending}
              autoComplete="username"
              className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1.5 font-khmer">
              Password / ពាក្យសម្ងាត់
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isRateLimited || loginMutation.isPending}
                autoComplete="current-password"
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && !isRateLimited && (
            <p className="text-red-400 text-sm font-khmer text-center">{errorMessage}</p>
          )}

          {attempts > 0 && attempts < 5 && !loginMutation.isPending && (
            <p className="text-amber-400 text-xs text-center font-khmer">
              ព្យាយាមទទួលខុសត្រូវ {attempts}/5 ដង
            </p>
          )}

          <Button
            type="submit"
            variant="gold"
            fullWidth
            size="lg"
            loading={loginMutation.isPending}
            disabled={isRateLimited || !username.trim() || !password.trim()}
          >
            ចូលប្រព័ន្ធ / Login
          </Button>
        </form>

        <p className="text-center text-white/15 text-xs mt-6">
          © 2026 អាធិរាជរឿង — Admin Only
        </p>
      </div>
    </div>
  )
}

export default AdminLoginPage
