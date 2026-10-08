import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Film, Users, CreditCard,
  Settings, LogOut, Menu, X, Shield
} from 'lucide-react'
import { useAdminAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', labelKh: 'ទំព័រដើម', icon: LayoutDashboard },
  { path: '/admin/movies', label: 'Movies', labelKh: 'រឿង', icon: Film },
  { path: '/admin/users', label: 'Users', labelKh: 'អ្នកប្រើ', icon: Users },
  { path: '/admin/deposits', label: 'Deposits', labelKh: 'ការដាក់ប្រាក់', icon: CreditCard },
  { path: '/admin/settings', label: 'Settings', labelKh: 'ការកំណត់', icon: Settings },
]

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-[#12121a] border-r border-white/5 transition-all duration-300 flex-shrink-0',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-[#d4af37]" />
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold text-sm font-khmer truncate">
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-white/30 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, labelKh, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-[#d4af37]/10 text-[#d4af37]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-none">{label}</p>
                  <p className="text-[10px] font-khmer opacity-60 mt-0.5 truncate">{labelKh}</p>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-2 py-4 border-t border-white/5">
          {sidebarOpen && admin && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white text-xs font-semibold truncate">{admin.username}</p>
              <p className="text-white/30 text-[10px] capitalize">{admin.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-xs font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
