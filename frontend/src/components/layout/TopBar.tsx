import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TopBarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
  transparent?: boolean
  className?: string
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
  className,
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center h-14 px-4 gap-3',
        transparent
          ? 'bg-transparent'
          : 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5',
        className
      )}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      )}

      {title && (
        <h1 className="flex-1 text-white font-semibold text-base font-khmer truncate">
          {title}
        </h1>
      )}

      {rightAction && (
        <div className="ml-auto flex items-center gap-2">{rightAction}</div>
      )}
    </header>
  )
}

export const NotificationButton: React.FC<{ count?: number }> = ({ count }) => (
  <button className="relative w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
    <Bell size={18} className="text-white/70" />
    {count && count > 0 ? (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    ) : null}
  </button>
)

export default TopBar
