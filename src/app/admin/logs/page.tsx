'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Eye, Trash2, CheckCircle, AlertTriangle, Info, Bug, Search, X, ChevronLeft, ChevronRight, Filter, Clock } from 'lucide-react'

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

interface LogsResponse {
  entries: LogEntry[]
  total: number
  page: number
  pages: number
}

const levelConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  error: { label: 'Error', color: 'text-[#e05555]', bg: 'bg-[#e05555]/10 border-[#e05555]/20', icon: AlertTriangle },
  warn: { label: 'Warning', color: 'text-[#d4a030]', bg: 'bg-[#d4a030]/10 border-[#d4a030]/20', icon: AlertTriangle },
  info: { label: 'Info', color: 'text-[#3cb371]', bg: 'bg-[#3cb371]/10 border-[#3cb371]/20', icon: Info },
  debug: { label: 'Debug', color: 'text-white/40', bg: 'bg-white/5 border-white/10', icon: Bug },
}

const levelColors: Record<string, string> = {
  error: '#e05555',
  warn: '#d4a030',
  info: '#3cb371',
  debug: '#808080',
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
      setStats({
        total: all.total || 0,
        errors: err.total || 0,
        warnings: warn.total || 0,
        unresolved: unres.total || 0,
      })
    } catch {}
  }, [])

  const fetchLogs = useCallback(async (pg: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '30' })
      if (level !== 'all') params.set('level', level)
      if (resolved !== 'all') params.set('resolved', resolved)
      if (search) params.set('q', search)
      const res = await fetch(`/api/logs?${params}`)
      const data: LogsResponse = await res.json()
      setLogs(data.entries)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
    } catch {} finally {
      setLoading(false)
    }
  }, [level, resolved, search])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchLogs(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, resolved])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, search])

  useEffect(() => {
    if (search !== undefined) {
      fetchLogs(1)
    }
  }, [search]) // eslint-disable-line

  const handleResolve = async (id: string, resolved: boolean) => {
    try {
      await fetch(`/api/logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolved: !resolved }),
      })
      setLogs(prev => prev.map(l => l.id === id ? { ...l, resolved: !resolved } : l))
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
    <div className="min-h-screen bg-[#060606]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[#1a1a1a]">
        <div className="flex justify-between items-center h-12 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-[#bf9b4e]/10 border border-[#bf9b4e]/20 flex items-center justify-center group-hover:bg-[#bf9b4e]/20 transition-colors">
                <AlertTriangle className="w-3.5 h-3.5 text-[#bf9b4e]" />
              </div>
              <span className="font-serif text-sm font-medium text-white">Logs</span>
              <span className="hidden sm:inline text-[11px] text-white/25 font-medium">· Errores y eventos</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#111] border border-[#1a1a1a] text-[11px] text-white/40 hover:text-white/70 hover:border-white/10 transition-all">
              ← Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-7xl mx-auto py-5 px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard value={stats.total} label="Total logs" icon={<Clock className="w-4 h-4" />} color="white" />
          <StatCard value={stats.errors} label="Errores" icon={<AlertTriangle className="w-4 h-4" />} color="red" />
          <StatCard value={stats.warnings} label="Warnings" icon={<AlertTriangle className="w-4 h-4" />} color="amber" />
          <StatCard value={stats.unresolved} label="Sin resolver" icon={<CheckCircle className="w-4 h-4" />} color="gold" />
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Level filter */}
          <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1">
            {(['all', 'error', 'warn', 'info', 'debug'] as LogLevel[]).map(l => (
              <button
                key={l}
                onClick={() => { setLevel(l); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  level === l
                    ? 'bg-[#bf9b4e] text-black'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {l === 'all' ? 'Todos' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>

          {/* Resolved filter */}
          <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1">
            {([
              { value: 'all', label: 'Todos' },
              { value: 'false', label: 'Sin resolver' },
              { value: 'true', label: 'Resueltos' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => { setResolved(opt.value); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  resolved === opt.value
                    ? 'bg-[#bf9b4e] text-black'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar en logs..."
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl h-10 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/30">{total} entradas</span>
          {search && <span className="text-xs text-[#bf9b4e]/70">Buscando: "{search}"</span>}
        </div>

        {/* Logs list */}
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0d0d0d] flex items-center justify-center border border-[#1a1a1a]">
                <CheckCircle className="w-6 h-6 text-white/10" />
              </div>
              <p className="text-lg font-medium text-white/40 mb-1">Sin errores</p>
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
                  className={`bg-[#0d0d0d] border rounded-2xl overflow-hidden transition-all ${
                    isExpanded ? 'border-[#bf9b4e]/30' : 'border-[#1a1a1a] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2">{log.message}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {log.resolved && (
                            <span className="text-[10px] font-medium text-[#3cb371] bg-[#3cb371]/10 px-2 py-0.5 rounded-md">Resuelto</span>
                          )}
                          <button
                            onClick={() => handleResolve(log.id, log.resolved)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
                            title={log.resolved ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            disabled={deletingId === log.id}
                            className="p-1.5 rounded-lg text-white/20 hover:text-[#e05555] hover:bg-[#e05555]/5 transition-all disabled:opacity-30"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-white/30">
                        {log.url && <span className="truncate max-w-[200px]" title={log.url}>{new URL(log.url).pathname}</span>}
                        <span>{timeAgo(log.createdAt)}</span>
                        {log.metadata && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="text-[#bf9b4e]/60 hover:text-[#bf9b4e] transition-colors flex items-center gap-1"
                          >
                            <Filter className="w-3 h-3" /> info
                          </button>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {log.stack && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1.5">Stack trace</p>
                              <pre className="text-xs text-white/40 bg-black/30 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-48">
                                {log.stack}
                              </pre>
                            </div>
                          )}
                          {log.metadata && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1.5">Metadata</p>
                              <pre className="text-xs text-white/40 bg-black/30 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                                {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.userAgent && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1">User Agent</p>
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
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); fetchLogs(Math.max(1, page - 1)) }}
              disabled={page <= 1}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-white/50 hover:text-white hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-sm text-white/30 px-4">{page} / {pages}</span>
            <button
              onClick={() => { setPage(p => Math.min(pages, p + 1)); fetchLogs(Math.min(pages, page + 1)) }}
              disabled={page >= pages}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-white/50 hover:text-white hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ value, label, icon, color }: { value: number | string; label: string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white',
    red: 'text-[#e05555]',
    amber: 'text-[#d4a030]',
    gold: 'text-[#bf9b4e]',
  }
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-white/30">{icon}</div>
        <span className="text-xs text-white/30 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${colorMap[color] || colorMap.white}`}>{value}</span>
    </div>
  )
}