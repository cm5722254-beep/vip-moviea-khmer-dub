import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { adminApi } from '../../lib/api'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'
import type { Deposit, PaginatedResponse, DepositStatus } from '../../types'

const METHOD_LABEL: Record<string, string> = {
  aba: 'ABA Bank',
  acleda: 'ACLEDA',
  wing: 'Wing',
  pipay: 'Pi Pay',
  manual: 'ផ្ទេរប្រាក់',
}

const STATUS_FILTERS: { id: DepositStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'ទាំងអស់' },
  { id: 'pending', label: 'រង់ចាំ' },
  { id: 'approved', label: 'អនុម័ត' },
  { id: 'rejected', label: 'បដិសេធ' },
]

export const AdminDepositsPage: React.FC = () => {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<DepositStatus | 'all'>('pending')
  const [rejectNote, setRejectNote] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'deposits', page, statusFilter],
    queryFn: async () => {
      const response = await adminApi.get<PaginatedResponse<Deposit>>('/admin/deposits', {
        params: {
          page,
          limit: 20,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      })
      return response.data
    },
    refetchInterval: 15000, // auto refresh pending
  })

  const approve = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.post(`/admin/deposits/${id}/approve`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'deposits'] }),
  })

  const reject = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await adminApi.post(`/admin/deposits/${id}/reject`, { note })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'deposits'] })
      setRejectTarget(null)
      setRejectNote('')
    },
  })

  const statusBadge = (status: DepositStatus) => {
    if (status === 'approved') return <Badge variant="success">Approved</Badge>
    if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>
    if (status === 'pending') return <Badge variant="warning">Pending</Badge>
    return <Badge variant="default">{status}</Badge>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Deposits</h1>
          <p className="text-white/40 text-sm font-khmer mt-0.5">គ្រប់គ្រងការដាក់ប្រាក់</p>
        </div>

        {/* Pending count badge */}
        {data && statusFilter === 'pending' && data.total > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <Clock size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold font-khmer">
              {data.total} រង់ចាំ
            </span>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setStatusFilter(f.id); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-xs font-khmer transition-colors ${
              statusFilter === f.id
                ? 'bg-[#d4af37] text-[#0a0a0f] font-semibold'
                : 'bg-[#1a1a24] text-white/50 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a24] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 text-xs font-normal">អ្នកប្រើ</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">វិធីបង់</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ចំនួន</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ស្ថានភាព</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ថ្ងៃ</th>
                <th className="text-right px-5 py-3 text-white/40 text-xs font-normal">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-white text-sm font-semibold truncate max-w-[140px] font-khmer">
                          {deposit.user?.firstName} {deposit.user?.lastName}
                        </p>
                        {deposit.user?.username && (
                          <p className="text-white/30 text-xs">@{deposit.user.username}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/60 text-xs font-khmer">
                          {METHOD_LABEL[deposit.method] || deposit.method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#d4af37] font-bold text-sm">${deposit.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(deposit.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-white/30 text-xs">{formatDate(deposit.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3">
                        {deposit.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => approve.mutate(deposit.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                            >
                              <CheckCircle size={12} />
                              អនុម័ត
                            </button>
                            <button
                              onClick={() => setRejectTarget(deposit.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                            >
                              <XCircle size={12} />
                              បដិសេធ
                            </button>
                          </div>
                        )}
                        {deposit.status !== 'pending' && deposit.adminNote && (
                          <span className="text-white/30 text-xs">{deposit.adminNote}</span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-white/30 text-xs font-khmer">{data.total} ការដាក់ប្រាក់</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                មុន
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                បន្ទាប់
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setRejectTarget(null)}>
          <div className="bg-[#1a1a24] rounded-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-4 font-khmer">បដិសេធការដាក់ប្រាក់</h2>
            <label className="block text-white/50 text-xs mb-1.5 font-khmer">មូលហេតុ (ជាជម្រើស)</label>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="ហេតុផល..."
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-red-500/40 font-khmer resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setRejectTarget(null)}>
                បោះបង់
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={reject.isPending}
                onClick={() => reject.mutate({ id: rejectTarget, note: rejectNote })}
              >
                បដិសេធ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDepositsPage
