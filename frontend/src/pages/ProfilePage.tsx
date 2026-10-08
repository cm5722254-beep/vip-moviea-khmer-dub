import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, History, Settings, HelpCircle, FileText,
  ShoppingBag, ChevronRight, LogOut, Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useWallet } from '../hooks/useWallet'
import { useMyPurchases } from '../hooks/usePurchases'
import { getTelegramUser } from '../lib/telegram'
import { ProfileSkeleton } from '../components/ui/Skeleton'

const FALLBACK_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='40' fill='%231a1a24'/%3E%3Ctext x='40' y='52' text-anchor='middle' fill='%23d4af37' font-size='36'%3E👤%3C/text%3E%3C/svg%3E`

interface MenuItem {
  icon: React.ReactNode
  label: string
  path?: string
  action?: () => void
  badge?: string
  danger?: boolean
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const tgUser = getTelegramUser()
  const { data: wallet } = useWallet()
  const { data: purchases } = useMyPurchases()

  const displayName =
    user?.firstName
      ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
      : tgUser?.first_name
        ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`
        : 'ភ្ញៀវ'

  const username = user?.username || tgUser?.username
  const photoUrl = user?.photoUrl || tgUser?.photo_url || FALLBACK_AVATAR
  const balance = wallet?.balance ?? user?.balance ?? 0
  const purchasedCount = purchases?.filter((p) => p.type === 'movie').length || 0

  const menuItems: MenuItem[] = [
    {
      icon: <History size={20} className="text-blue-400" />,
      label: 'ប្រវត្តិការមើល',
      path: '/my-movies',
    },
    {
      icon: <ShoppingBag size={20} className="text-[#d4af37]" />,
      label: 'រឿងបានទិញ',
      path: '/my-movies',
      badge: purchasedCount > 0 ? String(purchasedCount) : undefined,
    },
    {
      icon: <Wallet size={20} className="text-emerald-400" />,
      label: 'កាបូប & ប្រតិបត្តិការ',
      path: '/wallet',
    },
    {
      icon: <Settings size={20} className="text-white/40" />,
      label: 'ការកំណត់',
      path: '/settings',
    },
    {
      icon: <HelpCircle size={20} className="text-purple-400" />,
      label: 'ជំនួយ',
      path: '/help',
    },
    {
      icon: <FileText size={20} className="text-white/40" />,
      label: 'លក្ខខណ្ឌនៃការប្រើប្រាស់',
      path: '/terms',
    },
    {
      icon: <LogOut size={20} className="text-red-400" />,
      label: 'ចាកចេញ',
      action: () => {
        logout()
        navigate('/')
      },
      danger: true,
    },
  ]

  if (!isAuthenticated) {
    return <ProfileSkeleton />
  }

  return (
    <div className="page-container">
      {/* Profile header */}
      <div className="relative px-4 pt-8 pb-6 bg-gradient-to-b from-[#12121a] to-[#0a0a0f]">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full bg-[#d4af37]/5 blur-3xl mt-4" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar with gold ring */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f5c842] p-0.5">
              <div className="w-full h-full rounded-full bg-[#0a0a0f]" />
            </div>
            <img
              src={photoUrl}
              alt={displayName}
              className="relative w-24 h-24 rounded-full object-cover border-2 border-[#d4af37]/50"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = FALLBACK_AVATAR
              }}
            />
            {user?.isPremium && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg">
                <Star size={14} fill="#0a0a0f" className="text-[#0a0a0f]" />
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-white text-xl font-bold font-khmer mb-0.5">{displayName}</h1>
          {username && (
            <p className="text-white/40 text-sm mb-4">@{username}</p>
          )}

          {/* Stats row */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[#d4af37] text-xl font-bold">${balance.toFixed(2)}</p>
              <p className="text-white/40 text-xs font-khmer mt-0.5">សមតុល្យ</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-white text-xl font-bold">{purchasedCount}</p>
              <p className="text-white/40 text-xs font-khmer mt-0.5">រឿងបានទិញ</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-white text-xl font-bold">{user?.isPremium ? '⭐' : '—'}</p>
              <p className="text-white/40 text-xs font-khmer mt-0.5">
                {user?.isPremium ? 'Premium' : 'ធម្មតា'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu list */}
      <div className="px-4">
        <div className="bg-[#1a1a24] rounded-2xl border border-white/5 overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.action) {
                  item.action()
                } else if (item.path) {
                  navigate(item.path)
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
                item.danger
                  ? 'hover:bg-red-500/5'
                  : 'hover:bg-white/3'
              } ${index < menuItems.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <span
                className={`flex-1 text-sm font-khmer font-medium text-left ${
                  item.danger ? 'text-red-400' : 'text-white'
                }`}
              >
                {item.label}
              </span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold rounded-full">
                  {item.badge}
                </span>
              )}
              {!item.danger && (
                <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* App version */}
      <p className="text-center text-white/15 text-xs mt-6 pb-2 font-khmer">
        អាធិរាជរឿង v1.0.0
      </p>
    </div>
  )
}

export default ProfilePage
