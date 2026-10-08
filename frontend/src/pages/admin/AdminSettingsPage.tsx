import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Save, Shield } from 'lucide-react'
import { adminApi } from '../../lib/api'
import Button from '../../components/ui/Button'
import { useAdminAuthStore } from '../../stores/authStore'

export const AdminSettingsPage: React.FC = () => {
  const { admin } = useAdminAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [saved, setSaved] = useState(false)

  const changePassword = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await adminApi.post('/admin/auth/change-password', data)
    },
    onSuccess: () => {
      setSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err) => {
      setPasswordError(err instanceof Error ? err.message : 'Error')
    },
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 8 តួ')
      return
    }
    changePassword.mutate({ currentPassword, newPassword })
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Settings</h1>
        <p className="text-white/40 text-sm font-khmer mt-0.5">ការកំណត់ប្រព័ន្ធ</p>
      </div>

      {/* Admin info */}
      <div className="bg-[#1a1a24] rounded-2xl p-5 border border-white/5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
            <Shield size={20} className="text-[#d4af37]" />
          </div>
          <div>
            <p className="text-white font-semibold">{admin?.username}</p>
            <p className="text-white/40 text-xs capitalize">{admin?.role}</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-[#1a1a24] rounded-2xl p-5 border border-white/5">
        <h2 className="text-white font-semibold mb-4 font-khmer">ផ្លាស់ប្ដូរពាក្យសម្ងាត់</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs mb-1.5 font-khmer">ពាក្យសម្ងាត់បច្ចុប្បន្ន</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-1.5 font-khmer">ពាក្យសម្ងាត់ថ្មី</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-1.5 font-khmer">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 text-sm"
            />
          </div>

          {passwordError && (
            <p className="text-red-400 text-sm font-khmer">{passwordError}</p>
          )}

          {saved && (
            <p className="text-emerald-400 text-sm font-khmer">✓ ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្ដូរ</p>
          )}

          <Button
            type="submit"
            variant="gold"
            fullWidth
            loading={changePassword.isPending}
            leftIcon={<Save size={16} />}
          >
            រក្សាទុក
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AdminSettingsPage
