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
  error: { label: 'Error', color: 'text-[#e05555]', bg: 'bg-[#e05555]/8', border: 'border-[#e05555]/20', icon: AlertTriangle },
  warn: { label: 'Warning', color: 'text-[#d4a030]', bg: 'bg-[#d4a030]/8', border: 'border-[#d4a030]/20', icon: AlertTriangle },
  info: { label: 'Info', color: 'text-[#3cb371]', bg: 'bg-[#3cb371]/8', border: 'border-[#3cb371]/20', icon: Info },
  debug: { label: 'Debug', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', icon: Bug },
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
        <h1 className="font-serif text-2xl font-medium text-white">Logs del sistema</h1>
        <p className="text-sm text-white/30 mt-1">Errores y eventos registrados en tiempo real</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total logs', value: stats.total, icon: <Clock className="w-4 h-4" />, color: 'text-white' },
          { label: 'Errores', value: stats.errors, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-[#e05555]' },
          { label: 'Warnings', value: stats.warnings, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-[#d4a030]' },
          { label: 'Sin resolver', value: stats.unresolved, icon: <CheckCircle className="w-4 h-4" />, color: 'text-[#bf9b4e]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/25">{stat.icon}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">{stat.label}</span>
            </div>
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1">
          {(['all', 'error', 'warn', 'info', 'debug'] as LogLevel[]).map(l => (
            <button
              key={l}
              onClick={() => { setLevel(l); setPage(1); fetchLogs(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                level === l ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {l === 'all' ? 'Todos' : levelConfig[l]?.label || l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1">
          {([
            { value: 'all', label: 'Todos' },
            { value: 'false', label: 'Sin resolver' },
            { value: 'true', label: 'Resueltos' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => { setResolved(opt.value); setPage(1); fetchLogs(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                resolved === opt.value ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[180px] max-w-sm relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar errores..."
            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl h-10 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/15 transition-all"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); fetchLogs(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/30">{total} entradas</span>
        {search && <span className="text-xs text-[#bf9b4e]/70">Buscando: "{search}"</span>}
      </div>

      {/* Logs list */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0d0d0d] flex items-center justify-center mx-auto mb-4 border border-[#1a1a1a]">
              <CheckCircle className="w-6 h-6 text-[#3cb371]/40" />
            </div>
            <p className="text-base font-medium text-white/40 mb-1">Sin errores registrados</p>
            <p className="text-sm text-white/25">Todo funciona correctamente</p>
          </div>
        ) : (
          logs.map(log => {
            const cfg = levelConfig[log.level] || levelConfig.info
            const Icon = cfg.icon
            const isExpanded = expandedId === log.id

            return (
              <div
                key={log.id}
                className={`bg-[#0d0d0d] border rounded-2xl transition-all ${
                  isExpanded ? `border-[#bf9b4e]/30` : 'border-[#1a1a1a] hover:border-white/8'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-white/80 leading-relaxed line-clamp-2">{log.message}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {log.resolved && (
                          <span className="text-[10px] font-medium text-[#3cb371] bg-[#3cb371]/8 px-2 py-0.5 rounded-md border border-[#3cb371]/20">Resuelto</span>
                        )}
                        <button
                          onClick={() => handleResolve(log.id, log.resolved)}
                          className="p-1.5 rounded-lg text-white/20 hover:text-[#3cb371] hover:bg-[#3cb371]/5 transition-all"
                          title={log.resolved ? 'Desmarcar' : 'Marcar resuelto'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-1.5 rounded-lg text-white/20 hover:text-[#e05555] hover:bg-[#e05555]/5 transition-all disabled:opacity-30"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                      {log.url && (
                        <span className="truncate max-w-[180px]" title={log.url}>
                          {new URL(log.url).pathname}
                        </span>
                      )}
                      <span>{timeAgo(log.createdAt)}</span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
                      >
                        <Filter className="w-3 h-3" /> info
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {log.stack && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20 mb-2">Stack trace</p>
                            <pre className="text-xs text-white/35 bg-black/30 rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-40">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                        {log.metadata && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20 mb-2">Metadata</p>
                            <pre className="text-xs text-white/35 bg-black/30 rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.userAgent && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20 mb-1">User Agent</p>
                            <p className="text-xs text-white/30 font-mono">{log.userAgent}</p>
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
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-white/50 hover:text-white hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-sm text-white/30 px-4">{page} / {pages}</span>
          <button
            onClick={() => { const p = Math.min(pages, page + 1); setPage(p); fetchLogs(p) }}
            disabled={page >= pages}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-white/50 hover:text-white hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}