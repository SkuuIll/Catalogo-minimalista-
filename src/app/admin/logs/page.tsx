'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle, CheckCircle, Info, Bug, Search, X,
  ChevronLeft, ChevronRight, Filter, Clock, Trash2, Eye
} from 'lucide-react'

type LogLevel = 'all' | 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  id: string
  level: string
  message: string
  stack: string | null
  url: string | null
  userAgent: string | null
  metadata: string | null
  resolved: boolean
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
}

const levelConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  error: { label: 'Error', color: 'text-[#C0392B]', bg: 'bg-[#C0392B]/8', border: 'border-[#C0392B]/20', icon: AlertTriangle },
  warn: { label: 'Warning', color: 'text-[#C9A55A]', bg: 'bg-[#C9A55A]/8', border: 'border-[#C9A55A]/20', icon: AlertTriangle },
  info: { label: 'Info', color: 'text-[#3cb371]', bg: 'bg-[#3cb371]/8', border: 'border-[#3cb371]/20', icon: Info },
  debug: { label: 'Debug', color: 'text-[#8A8278]', bg: 'bg-[#8A8278]/5', border: 'border-[#8A8278]/10', icon: Bug },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [level, setLevel] = useState<LogLevel>('all')
  const [resolved, setResolved] = useState<'all' | 'true' | 'false'>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [stats, setStats] = useState({ total: 0, errors: 0, warnings: 0, unresolved: 0 })

  const fetchStats = useCallback(async () => {
    try {
      const [all, err, warn, unres] = await Promise.all([
        fetch('/api/logs?limit=1').then(r => r.json()),
        fetch('/api/logs?level=error&limit=1').then(r => r.json()),
        fetch('/api/logs?level=warn&limit=1').then(r => r.json()),
        fetch('/api/logs?resolved=false&limit=1').then(r => r.json()),
      ])
      setStats({ total: all.total || 0, errors: err.total || 0, warnings: warn.total || 0, unresolved: unres.total || 0 })
    } catch {}
  }, [])

  const fetchLogs = useCallback(async (pg: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '25' })
      if (level !== 'all') params.set('level', level)
      if (resolved !== 'all') params.set('resolved', resolved)
      if (search) params.set('q', search)
      const res = await fetch(`/api/logs?${params}`)
      const data = await res.json()
      setLogs(data.entries)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
    } catch {} finally {
      setLoading(false)
    }
  }, [level, resolved, search])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchLogs(1) }, [fetchLogs]) // eslint-disable-line

  useEffect(() => {
    const timer = setTimeout(() => { if (search !== searchInput) { setSearch(searchInput); fetchLogs(1) } }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, search, fetchLogs])

  const handleResolve = async (id: string, currentResolved: boolean) => {
    try {
      await fetch(`/api/logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolved: !currentResolved }),
      })
      setLogs(prev => prev.map(l => l.id === id ? { ...l, resolved: !currentResolved } : l))
      fetchStats()
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este log?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/logs/${id}?id=${id}`, { method: 'DELETE' })
      setLogs(prev => prev.filter(l => l.id !== id))
      fetchStats()
    } catch {} finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-light text-[#F0EAE0] tracking-[0.02em]">Logs del sistema</h1>
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] mt-1">Errores y eventos registrados en tiempo real</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total logs', value: stats.total, icon: <Clock className="w-4 h-4" strokeWidth={1.5} />, color: 'text-[#F0EAE0]' },
          { label: 'Errores', value: stats.errors, icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />, color: 'text-[#C0392B]' },
          { label: 'Warnings', value: stats.warnings, icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />, color: 'text-[#C9A55A]' },
          { label: 'Sin resolver', value: stats.unresolved, icon: <CheckCircle className="w-4 h-4" strokeWidth={1.5} />, color: 'text-[#C9A55A]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#221E1A] border border-[#2E2925] rounded-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#8A8278]/25">{stat.icon}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8278]/40">{stat.label}</span>
            </div>
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-[#221E1A] border border-[#2E2925] rounded-sm p-1">
          {(['all', 'error', 'warn', 'info', 'debug'] as LogLevel[]).map(l => (
            <button
              key={l}
              onClick={() => { setLevel(l); setPage(1); fetchLogs(1) }}
              className={`px-3 py-1.5 rounded-sm text-[11px] font-normal uppercase tracking-[0.12em] transition-all ${
                level === l ? 'bg-[#C9A55A] text-[#1A1714]' : 'text-[#8A8278] hover:text-[#F0EAE0]'
              }`}
            >
              {l === 'all' ? 'Todos' : levelConfig[l]?.label || l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-[#221E1A] border border-[#2E2925] rounded-sm p-1">
          {([
            { value: 'all', label: 'Todos' },
            { value: 'false', label: 'Sin resolver' },
            { value: 'true', label: 'Resueltos' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => { setResolved(opt.value); setPage(1); fetchLogs(1) }}
              className={`px-3 py-1.5 rounded-sm text-[11px] font-normal uppercase tracking-[0.12em] transition-all ${
                resolved === opt.value ? 'bg-[#C9A55A] text-[#1A1714]' : 'text-[#8A8278] hover:text-[#F0EAE0]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[180px] max-w-sm relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]/25 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar errores..."
            className="w-full bg-[#221E1A] border border-[#2E2925] rounded-sm h-10 pl-10 pr-4 text-sm text-[#F0EAE0] placeholder-[#8A8278]/20 focus:outline-none focus:border-[#3D3830] transition-all"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); fetchLogs(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8278]/30 hover:text-[#8A8278] transition-colors">
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#8A8278]/30">{total} entradas</span>
        {search && <span className="text-xs text-[#C9A55A]/70">Buscando: "{search}"</span>}
      </div>

      {/* Logs list */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-sm bg-[#221E1A] border border-[#2E2925] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-sm bg-[#221E1A] flex items-center justify-center mx-auto mb-4 border border-[#2E2925]">
              <CheckCircle className="w-6 h-6 text-[#3cb371]/40" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-[#8A8278] mb-1">Sin errores registrados</p>
            <p className="text-[13px] text-[#8A8278]/40">Todo funciona correctamente</p>
          </div>
        ) : (
          logs.map(log => {
            const cfg = levelConfig[log.level] || levelConfig.info
            const Icon = cfg.icon
            const isExpanded = expandedId === log.id

            return (
              <div
                key={log.id}
                className={`bg-[#221E1A] border rounded-sm transition-all ${
                  isExpanded ? `border-[#C9A55A]/30` : 'border-[#2E2925] hover:border-[#F0EAE0]/[0.08]'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className={`w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[#F0EAE0]/80 leading-relaxed line-clamp-2">{log.message}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {log.resolved && (
                          <span className="text-[10px] font-medium text-[#3cb371] bg-[#3cb371]/8 px-2 py-0.5 rounded-sm border border-[#3cb371]/20">Resuelto</span>
                        )}
                        <button
                          onClick={() => handleResolve(log.id, log.resolved)}
                          className="p-1.5 rounded-sm text-[#8A8278]/30 hover:text-[#3cb371] hover:bg-[#3cb371]/5 transition-all"
                          title={log.resolved ? 'Desmarcar' : 'Marcar resuelto'}
                        >
                          <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-1.5 rounded-sm text-[#8A8278]/30 hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-all disabled:opacity-30"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-[#8A8278]/30">
                      {log.url && (
                        <span className="truncate max-w-[180px]" title={log.url}>
                          {new URL(log.url).pathname}
                        </span>
                      )}
                      <span>{timeAgo(log.createdAt)}</span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1 text-[#8A8278]/40 hover:text-[#8A8278] transition-colors"
                      >
                        <Filter className="w-3 h-3" strokeWidth={1.5} /> info
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {log.stack && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]/30 mb-2">Stack trace</p>
                            <pre className="text-xs text-[#8A8278]/40 bg-[#161310] rounded-sm p-3.5 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-40">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                        {log.metadata && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]/30 mb-2">Metadata</p>
                            <pre className="text-xs text-[#8A8278]/40 bg-[#161310] rounded-sm p-3.5 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.userAgent && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]/30 mb-1">User Agent</p>
                            <p className="text-xs text-[#8A8278]/30 font-mono">{log.userAgent}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4">
          <button
            onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchLogs(p) }}
            disabled={page <= 1}
            className="flex items-center gap-1.5 h-10 px-4 rounded-sm bg-[#221E1A] border border-[#2E2925] text-sm text-[#8A8278]/50 hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> Anterior
          </button>
          <span className="text-sm text-[#8A8278]/30 px-4">{page} / {pages}</span>
          <button
            onClick={() => { const p = Math.min(pages, page + 1); setPage(p); fetchLogs(p) }}
            disabled={page >= pages}
            className="flex items-center gap-1.5 h-10 px-4 rounded-sm bg-[#221E1A] border border-[#2E2925] text-sm text-[#8A8278]/50 hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  )
}
