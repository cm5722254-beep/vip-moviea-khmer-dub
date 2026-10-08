import React from 'react'
import { AlertCircle, ShoppingCart } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { usePurchase } from '../../hooks/usePurchases'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { hapticFeedback, hapticNotification } from '../../lib/telegram'
import type { Movie, Episode } from '../../types'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'movie' | 'episode'
  movie?: Movie
  episode?: Episode
  onSuccess?: () => void
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  type,
  movie,
  episode,
  onSuccess,
}) => {
  const { user } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const purchase = usePurchase()

  const targetId = type === 'movie' ? movie?.id : episode?.id
  const price = type === 'movie' ? (movie?.price ?? 0) : (episode?.movie?.price ?? 0)
  const title = type === 'movie' ? (movie?.titleKh || movie?.title) : (episode?.titleKh || episode?.title)
  const posterUrl = type === 'movie' ? movie?.posterUrl : movie?.posterUrl

  const userBalance = user?.balance ?? 0
  const hasEnough = userBalance >= price

  const handleConfirm = async () => {
    if (!targetId) return
    hapticFeedback('medium')
    try {
      await purchase.mutateAsync({ type, id: targetId })
      hapticNotification('success')
      addToast('success', 'ការទិញបានជោគជ័យ!')
      onSuccess?.()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ការទិញមានបញ្ហា'
      hapticNotification('error')
      addToast('error', msg)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ទិញរឿង" showClose>
      <div className="space-y-5">
        {/* Movie/episode info */}
        <div className="flex gap-4">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="w-16 h-24 rounded-xl object-cover flex-shrink-0 bg-[#12121a]"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs font-khmer mb-1">
              {type === 'movie' ? 'រឿង' : `ភាគទី ${episode?.episodeNumber}`}
            </p>
            <h3 className="text-white font-semibold font-khmer text-base leading-6 line-clamp-2">
              {title}
            </h3>
            {movie?.category && (
              <span className="text-white/30 text-xs font-khmer">
                {movie.category.nameKh || movie.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/50 font-khmer text-sm">តម្លៃ</span>
            <span className="text-[#d4af37] font-bold text-lg">${price.toFixed(2)}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-white/50 font-khmer text-sm">សមតុល្យបច្ចុប្បន្ន</span>
            <span className={`font-bold text-base ${hasEnough ? 'text-white' : 'text-red-400'}`}>
              ${userBalance.toFixed(2)}
            </span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-white/50 font-khmer text-sm">សមតុល្យបន្ទាប់ពីទិញ</span>
            <span className={`font-bold text-base ${hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
              {hasEnough ? `$${(userBalance - price).toFixed(2)}` : 'មិនគ្រប់គ្រាន់'}
            </span>
          </div>
        </div>

        {/* Insufficient balance warning */}
        {!hasEnough && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-semibold font-khmer">សមតុល្យមិនគ្រប់គ្រាន់</p>
              <p className="text-white/40 text-xs font-khmer mt-0.5">
                សូមដាក់ប្រាក់ ${(price - userBalance).toFixed(2)} ទៀត
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            បោះបង់
          </Button>
          <Button
            variant="gold"
            onClick={handleConfirm}
            loading={purchase.isPending}
            disabled={!hasEnough}
            leftIcon={<ShoppingCart size={16} />}
            className="flex-1"
          >
            {hasEnough ? 'ទិញឥឡូវ' : 'មិនគ្រប់ប្រាក់'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PurchaseModal
