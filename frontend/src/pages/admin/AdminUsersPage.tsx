import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserX, UserCheck, DollarSign } from 'lucide-react'
import { adminApi } from '../../lib/api'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'
import type { User, PaginatedResponse } from '../../types'

export const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [adjustUser, setAdjustUser] = useState<User | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: async () => {
      const response = await adminApi.get<PaginatedResponse<User>>('/admin/users', {
        params: { page, limit: 20, search: search || undefined },
      })
      return response.data
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminApi.patch(`/admin/users/${id}/status`, { status })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const adjustBalance = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      await adminApi.post(`/admin/users/${id}/adjust-balance`, { amount })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setAdjustUser(null)
      setAdjustAmount('')
    },
  })

  const handleAdjustSubmit = () => {
    if (!adjustUser || !adjustAmount) return
    const amount = parseFloat(adjustAmount)
    if (isNaN(amount)) return
    adjustBalance.mutate({ id: adjustUser.id, amount })
  }

  const statusBadge = (status: string) => {
    if (status === 'active') return <Badge variant="success">Active</Badge>
    if (status === 'banned') return <Badge variant="danger">Banned</Badge>
    return <Badge variant="warning">Suspended</Badge>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Users</h1>
          <p className="text-white/40 text-sm font-khmer mt-0.5">គ្រប់គ្រងអ្នកប្រើ</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          placeholder="ស្វែងរកអ្នកប្រើ..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 max-w-sm font-khmer"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a24] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 text-xs font-normal">អ្នកប្រើ</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">Telegram ID</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">សមតុល្យ</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ស្ថានភាព</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ថ្ងៃចូល</th>
                <th className="text-right px-5 py-3 text-white/40 text-xs font-normal">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {user.photoUrl && (
                            <img src={user.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate max-w-[140px]">
                              {user.firstName} {user.lastName}
                            </p>
                            {user.username && (
                              <p className="text-white/30 text-xs">@{user.username}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/40 text-xs font-mono">{user.telegramId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#d4af37] text-sm font-bold">${user.balance.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(user.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-white/30 text-xs">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setAdjustUser(user)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            title="Adjust balance"
                          >
                            <DollarSign size={14} />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => updateStatus.mutate({ id: user.id, status: 'banned' })}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                              title="Ban user"
                            >
                              <UserX size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus.mutate({ id: user.id, status: 'active' })}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 transition-colors"
                              title="Unban user"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-white/30 text-xs font-khmer">{data.total} អ្នកប្រើ</span>
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

      {/* Adjust Balance Modal */}
      {adjustUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setAdjustUser(null)}>
          <div className="bg-[#1a1a24] rounded-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-1">Adjust Balance</h2>
            <p className="text-white/40 text-sm font-khmer mb-4">
              {adjustUser.firstName} — Current: ${adjustUser.balance.toFixed(2)}
            </p>
            <p className="text-white/50 text-xs mb-1.5 font-khmer">
              ចំនួន (ដាក់ + ឬ ដក -)
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="+5.00 or -2.00"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 mb-4"
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setAdjustUser(null)}>
                បោះបង់
              </Button>
              <Button
                variant="gold"
                className="flex-1"
                loading={adjustBalance.isPending}
                onClick={handleAdjustSubmit}
              >
                រក្សាទុក
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
