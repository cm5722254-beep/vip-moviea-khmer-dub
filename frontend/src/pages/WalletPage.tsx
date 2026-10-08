import React, { useState } from 'react'
import {
  Plus, ArrowDownCircle, ArrowUpCircle, Gift,
  RotateCcw, TrendingUp
} from 'lucide-react'
import { useWallet, useTransactions } from '../hooks/useWallet'
import { useAuthStore } from '../stores/authStore'
import DepositModal from '../components/wallet/DepositModal'
import Button from '../components/ui/Button'
import { TransactionSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { formatDate } from '../lib/utils'
import type { Transaction } from '../types'

const txIcon: Record<string, React.ReactNode> = {
  deposit: <ArrowDownCircle size={18} className="text-emerald-400" />,
  purchase: <ArrowUpCircle size={18} className="text-red-400" />,
  refund: <RotateCcw size={18} className="text-blue-400" />,
  bonus: <Gift size={18} className="text-[#d4af37]" />,
  withdrawal: <TrendingUp size={18} className="text-orange-400" />,
}

const txLabel: Record<string, string> = {
  deposit: 'ដាក់ប្រាក់',
  purchase: 'ទិញរឿង',
  refund: 'សងប្រាក់',
  bonus: 'រង្វាន់',
  withdrawal: 'ដកប្រាក់',
}

const txStatusLabel: Record<string, string> = {
  pending: 'រង់ចាំ',
  completed: 'ជោគជ័យ',
  failed: 'បរាជ័យ',
  cancelled: 'បោះបង់',
}

const txStatusColor: Record<string, string> = {
  pending: 'text-amber-400',
  completed: 'text-emerald-400',
  failed: 'text-red-400',
  cancelled: 'text-white/30',
}

function TransactionCard({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === 'deposit' || tx.type === 'refund' || tx.type === 'bonus'
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-full bg-[#1a1a24] flex items-center justify-center flex-shrink-0">
        {txIcon[tx.type] || <ArrowUpCircle size={18} className="text-white/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold font-khmer truncate">
          {tx.descriptionKh || tx.description || txLabel[tx.type] || tx.type}
        </p>
        <p className="text-white/30 text-[10px] mt-0.5 font-khmer">
          {formatDate(tx.createdAt)} •{' '}
          <span className={txStatusColor[tx.status]}>{txStatusLabel[tx.status]}</span>
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
        </p>
        <p className="text-white/20 text-[10px]">${tx.balanceAfter.toFixed(2)}</p>
      </div>
    </div>
  )
}

export const WalletPage: React.FC = () => {
  const { user } = useAuthStore()
  const [depositOpen, setDepositOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data: wallet, isLoading: loadingWallet } = useWallet()
  const { data: txData, isLoading: loadingTx } = useTransactions(page)

  const balance = wallet?.balance ?? user?.balance ?? 0

  return (
    <div className="page-container">
      {/* Balance card */}
      <div className="relative mx-4 mt-6 mb-6 bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-3xl p-6 border border-white/10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#d4af37]/5 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-[#d4af37]/3 blur-xl" />

        <div className="relative z-10">
          <p className="text-white/40 text-xs font-khmer mb-1">សមតុល្យសរុប</p>
          {loadingWallet ? (
            <div className="h-10 w-40 bg-white/10 rounded-xl animate-pulse" />
          ) : (
            <p className="text-[#d4af37] text-4xl font-bold tracking-tight">
              ${balance.toFixed(2)}
            </p>
          )}

          {/* Stats row */}
          {wallet && (
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-white/30 text-[10px] font-khmer">សរុបដាក់</p>
                <p className="text-white/70 text-sm font-semibold">${wallet.totalDeposited.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] font-khmer">សរុបចំណាយ</p>
                <p className="text-white/70 text-sm font-semibold">${wallet.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Deposit button */}
          <Button
            variant="gold"
            size="lg"
            fullWidth
            leftIcon={<Plus size={18} />}
            onClick={() => setDepositOpen(true)}
            className="mt-5"
          >
            ដាក់ប្រាក់
          </Button>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-white font-semibold text-base font-khmer flex items-center gap-2">
            <span className="w-1 h-5 bg-[#d4af37] rounded-full" />
            ប្រតិបត្តិការ
          </h2>
          {txData && (
            <span className="text-white/30 text-xs font-khmer">{txData.total} ប្រតិបត្តិការ</span>
          )}
        </div>

        <div className="bg-[#1a1a24] mx-4 rounded-2xl border border-white/5 overflow-hidden">
          {loadingTx ? (
            <>
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </>
          ) : txData?.data && txData.data.length > 0 ? (
            <>
              {txData.data.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}

              {/* Pagination */}
              {txData.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    មុន
                  </Button>
                  <span className="text-white/30 text-xs font-khmer">
                    {page} / {txData.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= txData.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    បន្ទាប់
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState type="wallet" className="py-10" />
          )}
        </div>
      </div>

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  )
}

export default WalletPage
