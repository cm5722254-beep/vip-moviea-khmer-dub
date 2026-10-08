import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Film, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'
import type { DashboardStats, Transaction } from '../../types'

const txTypeLabel: Record<string, string> = {
  deposit: 'ដាក់ប្រាក់',
  purchase: 'ទិញរឿង',
  refund: 'សងប្រាក់',
  bonus: 'រង្វាន់',
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  labelKh: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-[#1a1a24] rounded-2xl p-5 border border-white/5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
      <p className="text-white/50 text-xs mt-1">{label}</p>
      {sub && <p className="text-white/30 text-[10px] mt-0.5">{sub}</p>}
    </div>
  )
}

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await adminApi.get<DashboardStats>('/admin/dashboard/stats')
      return response.data
    },
    refetchInterval: 30000, // refresh every 30s
  })

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-white/40 text-sm font-khmer mt-0.5">ទិដ្ឋភាពទូទៅ</p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Users size={20} className="text-blue-400" />}
            label="Total Users"
            labelKh="អ្នកប្រើសរុប"
            value={stats.totalUsers.toLocaleString()}
            sub={`${stats.activeUsers} active`}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<Film size={20} className="text-purple-400" />}
            label="Movies"
            labelKh="រឿងសរុប"
            value={stats.totalMovies}
            sub={`${stats.publishedMovies} published`}
            color="bg-purple-500/10"
          />
          <StatCard
            icon={<DollarSign size={20} className="text-emerald-400" />}
            label="Today Revenue"
            labelKh="ចំណូលថ្ងៃនេះ"
            value={`$${stats.todaySales.toFixed(2)}`}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-[#d4af37]" />}
            label="Total Revenue"
            labelKh="ចំណូលសរុប"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="bg-[#d4af37]/10"
          />
          <StatCard
            icon={<DollarSign size={20} className="text-emerald-400" />}
            label="Today Deposits"
            labelKh="ដាក់ប្រាក់ថ្ងៃនេះ"
            value={`$${stats.todayDeposits.toFixed(2)}`}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<Clock size={20} className="text-amber-400" />}
            label="Pending Deposits"
            labelKh="ការដាក់ប្រាក់រង់ចាំ"
            value={stats.pendingDeposits}
            color="bg-amber-500/10"
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-emerald-400" />}
            label="Total Transactions"
            labelKh="ប្រតិបត្តិការសរុប"
            value={stats.totalTransactions.toLocaleString()}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-blue-400" />}
            label="Active Today"
            labelKh="សកម្មថ្ងៃនេះ"
            value={stats.activeUsers}
            color="bg-blue-500/10"
          />
        </div>
      ) : null}

      {/* Recent Transactions */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">ប្រតិបត្តិការថ្មីៗ</h2>
        <div className="bg-[#1a1a24] rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))
          ) : stats?.recentTransactions?.length ? (
            stats.recentTransactions.map((tx: Transaction) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'deposit' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.type === 'deposit'
                    ? <DollarSign size={16} className="text-emerald-400" />
                    : <Film size={16} className="text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold font-khmer truncate">
                    {txTypeLabel[tx.type] || tx.type}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs font-khmer ${
                    tx.status === 'completed' ? 'text-emerald-400/70' :
                    tx.status === 'pending' ? 'text-amber-400' : 'text-red-400/70'
                  }`}>
                    {tx.status === 'completed' ? 'ជោគជ័យ' : tx.status === 'pending' ? 'រង់ចាំ' : 'បរាជ័យ'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-white/30 font-khmer text-sm">
              គ្មានប្រតិបត្តិការ
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
