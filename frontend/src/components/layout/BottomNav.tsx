import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Film, Wallet, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { hapticFeedback } from '../../lib/telegram'

const tabs = [
  { path: '/', label: 'ទំព័រដើម', icon: Home, exact: true },
  { path: '/search', label: 'ស្វែងរក', icon: Search },
  { path: '/my-movies', label: 'រឿងរបស់ខ្ញុំ', icon: Film },
  { path: '/wallet', label: 'កាបូប', icon: Wallet },
  { path: '/profile', label: 'គណនី', icon: User },
]

export const BottomNav: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d18]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon, exact }) => {
          const active = isActive(path, exact)
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
              onClick={() => hapticFeedback('light')}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-2 w-1 h-1 rounded-full bg-[#d4af37] animate-pulse-gold" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200',
                  active
                    ? 'bg-[#d4af37]/15'
                    : 'bg-transparent'
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    'transition-all duration-200',
                    active
                      ? 'text-[#d4af37] scale-110'
                      : 'text-white/40'
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[9px] font-khmer transition-all duration-200 leading-none',
                  active ? 'text-[#d4af37] font-semibold' : 'text-white/30'
                )}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
