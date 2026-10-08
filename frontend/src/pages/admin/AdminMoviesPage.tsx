import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Eye, EyeOff, Film, Search } from 'lucide-react'
import { adminApi } from '../../lib/api'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'
import type { Movie, PaginatedResponse } from '../../types'

export const AdminMoviesPage: React.FC = () => {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editMovie, setEditMovie] = useState<Movie | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'movies', page, search],
    queryFn: async () => {
      const response = await adminApi.get<PaginatedResponse<Movie>>('/admin/movies', {
        params: { page, limit: 15, search: search || undefined },
      })
      return response.data
    },
  })

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await adminApi.patch(`/admin/movies/${id}`, { isPublished })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movies'] }),
  })

  const deleteMovie = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/admin/movies/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movies'] }),
  })

  const handleDelete = (movie: Movie) => {
    if (confirm(`Delete "${movie.titleKh}"?`)) {
      deleteMovie.mutate(movie.id)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Movies</h1>
          <p className="text-white/40 text-sm font-khmer mt-0.5">គ្រប់គ្រងរឿង</p>
        </div>
        <Button
          variant="gold"
          leftIcon={<Plus size={16} />}
          onClick={() => { setEditMovie(null); setShowForm(true) }}
        >
          បន្ថែមរឿង
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          placeholder="ស្វែងរករឿង..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/40 max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a24] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 text-xs font-normal">រឿង</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ប្រភេទ</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">តម្លៃ</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ភាគ</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ស្ថានភាព</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-normal">ថ្ងៃបន្ថែម</th>
                <th className="text-right px-5 py-3 text-white/40 text-xs font-normal">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((movie) => (
                    <tr key={movie.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt="" className="w-8 h-11 rounded object-cover bg-[#12121a] flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-11 rounded bg-[#12121a] flex items-center justify-center flex-shrink-0">
                              <Film size={14} className="text-white/20" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold font-khmer truncate max-w-[180px]">
                              {movie.titleKh || movie.title}
                            </p>
                            <p className="text-white/30 text-xs truncate max-w-[180px]">{movie.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/50 text-xs font-khmer">
                          {movie.category?.nameKh || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {movie.isFree ? (
                          <Badge variant="free">FREE</Badge>
                        ) : (
                          <span className="text-[#d4af37] text-xs font-bold">${movie.price.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/50 text-xs">{movie.episodesCount || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePublish.mutate({ id: movie.id, isPublished: !movie.isPublished })}
                          className="flex items-center gap-1"
                        >
                          {movie.isPublished ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="warning">Draft</Badge>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/30 text-xs">{formatDate(movie.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => togglePublish.mutate({ id: movie.id, isPublished: !movie.isPublished })}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            title={movie.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {movie.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => { setEditMovie(movie); setShowForm(true) }}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(movie)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
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
            <span className="text-white/30 text-xs font-khmer">
              {data.total} រឿង — ទំព័រ {page}/{data.totalPages}
            </span>
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

      {/* Movie form modal — placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#1a1a24] rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-bold text-lg mb-4 font-khmer">
              {editMovie ? 'កែប្រែរឿង' : 'បន្ថែមរឿង'}
            </h2>
            <p className="text-white/40 text-sm font-khmer">
              ទម្រង់បញ្ចូលនឹងត្រូវបង្ហាញនៅទីនេះ
            </p>
            <Button variant="secondary" fullWidth className="mt-4" onClick={() => setShowForm(false)}>
              បិទ
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMoviesPage
