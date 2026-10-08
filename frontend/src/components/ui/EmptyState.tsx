import React from 'react'
import { Film, Search, Wallet, ShoppingBag, Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  type?: 'movies' | 'search' | 'wallet' | 'purchases' | 'generic'
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const icons = {
  movies: Film,
  search: Search,
  wallet: Wallet,
  purchases: ShoppingBag,
  generic: Inbox,
}

const defaultContent = {
  movies: {
    title: 'មិនមានរឿង',
    description: 'មិនទាន់មានរឿងណាមួយនៅឡើយ',
  },
  search: {
    title: 'រកមិនឃើញ',
    description: 'សូមមើលការស្វែងរករបស់អ្នក ឬសាកល្បងពាក្យផ្សេង',
  },
  wallet: {
    title: 'គ្មានប្រតិបត្តិការ',
    description: 'អ្នកមិនទាន់មានប្រតិបត្តិការណាមួយ',
  },
  purchases: {
    title: 'មិនទាន់មានរឿងទិញ',
    description: 'ទិញរឿងរបស់អ្នក ហើយចាប់ផ្តើមមើលឥឡូវនេះ',
  },
  generic: {
    title: 'គ្មានទិន្នន័យ',
    description: 'មិនមានទិន្នន័យដែលត្រូវបង្ហាញ',
  },
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  action,
  className,
}) => {
  const Icon = icons[type]
  const defaults = defaultContent[type]

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-[#1a1a24] flex items-center justify-center mb-5">
        <Icon size={36} className="text-white/20" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2 font-khmer">
        {title || defaults.title}
      </h3>
      <p className="text-white/40 text-sm font-khmer max-w-xs leading-relaxed">
        {description || defaults.description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export default EmptyState
