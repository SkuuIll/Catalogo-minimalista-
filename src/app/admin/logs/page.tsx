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
  error: { label: 'ERROR', color: 'text-[#C0392B]', bg: 'bg-[#C0392B]/5', border: 'border-[#C0392B]/20', icon: AlertTriangle },
  warn: { label: 'WARNING', color: 'text-[#c9a55a]', bg: 'bg-[#c9a55a]/5', border: 'border-[#c9a55a]/20', icon: AlertTriangle },
  info: { label: 'INFO', color: 'text-[#3cb371]', bg: 'bg-[#3cb371]/5', border: 'border-[#3cb371]/20', icon: Info },
  debug: { label: 'DEBUG', color: 'text-[#666]', bg: 'bg-[#666]/5', border: 'border-[#666]/10', icon: Bug },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s AGO`
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`
  return `${Math.floor(diff / 86400)}D AGO`
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
    if (!confirm('Delete this log?')) return
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
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-light text-[#e8e8e8] tracking-[0.05em]">SYSTEM LOGS</h1>
        <p className="text-[9px] uppercase tracking-[0.25em] text-[#666] mt-1">REAL-TIME ERRORS AND EVENTS</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total logs', value: stats.total, icon: <Clock className="w-4 h-4" strokeWidth={1} />, color: 'text-[#e8e8e8]' },
          { label: 'Errors', value: stats.errors, icon: <AlertTriangle className="w-4 h-4" strokeWidth={1} />, color: 'text-[#C0392B]' },
          { label: 'Warnings', value: stats.warnings, icon: <AlertTriangle className="w-4 h-4" strokeWidth={1} />, color: 'text-[#c9a55a]' },
          { label: 'Unresolved', value: stats.unresolved, icon: <CheckCircle className="w-4 h-4" strokeWidth={1} />, color: 'text-[#c9a55a]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-none px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#222]">{stat.icon}</span>
              <span className="text-[8px] font-medium uppercase tracking-[0.25em] text-[#666]">{stat.label}</span>
            </div>
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-none p-0.5">
          {(['all', 'error', 'warn', 'info', 'debug'] as LogLevel[]).map(l => (
            <button
              key={l}
              onClick={() => { setLevel(l); setPage(1); fetchLogs(1) }}
              className={`px-4 py-2 rounded-none text-[8px] font-medium uppercase tracking-[0.2em] transition-all ${
                level === l ? 'bg-[#c9a55a] text-[#0a0a0a]' : 'text-[#666] hover:text-[#e8e8e8]'
              }`}
            >
              {l === 'all' ? 'ALL' : levelConfig[l]?.label || l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-none p-0.5">
          {([
            { value: 'all', label: 'All' },
            { value: 'false', label: 'Unresolved' },
            { value: 'true', label: 'Resolved' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => { setResolved(opt.value); setPage(1); fetchLogs(1) }}
              className={`px-4 py-2 rounded-none text-[8px] font-medium uppercase tracking-[0.2em] transition-all ${
                resolved === opt.value ? 'bg-[#c9a55a] text-[#0a0a0a]' : 'text-[#666] hover:text-[#e8e8e8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[180px] max-w-sm relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="SEARCH ERRORS"
            className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-none h-11 pl-11 pr-4 text-[13px] uppercase tracking-[0.15em] text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#2a2a2a] transition-all"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); fetchLogs(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#e8e8e8] transition-colors">
              <X className="w-4 h-4" strokeWidth={1} />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#444]">{total} ENTRIES</span>
        {search && <span className="text-[9px] uppercase tracking-[0.2em] text-[#c9a55a]">SEARCHING: "{search}"</span>}
      </div>

      {/* Logs list */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-none bg-[#0f0f0f] border border-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-[#3cb371]/40" strokeWidth={1} />
            </div>
            <p className="text-[#666] text-[13px] uppercase tracking-[0.2em] mb-1">NO ERRORS REGISTERED</p>
            <p className="text-[#444] text-[11px] uppercase tracking-[0.15em]">ALL SYSTEMS OPERATIONAL</p>
          </div>
        ) : (
          logs.map(log => {
            const cfg = levelConfig[log.level] || levelConfig.info
            const Icon = cfg.icon
            const isExpanded = expandedId === log.id

            return (
              <div
                key={log.id}
                className={`bg-[#0f0f0f] border rounded-none transition-all ${
                  isExpanded ? `border-[#c9a55a]/30` : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} strokeWidth={1} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] font-serif font-light text-[#e8e8e8] leading-relaxed line-clamp-2 tracking-[0.05em]">{log.message}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {log.resolved && (
                          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-[#3cb371] bg-[#3cb371]/5 px-2.5 py-1 rounded-none border border-[#3cb371]/20">RESOLVED</span>
                        )}
                        <button
                          onClick={() => handleResolve(log.id, log.resolved)}
                          className="p-2 rounded-none text-[#666] hover:text-[#3cb371] hover:bg-[#3cb371]/5 transition-all"
                          title={log.resolved ? 'Mark unresolved' : 'Mark resolved'}
                        >
                          <CheckCircle className="w-4 h-4" strokeWidth={1} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-2 rounded-none text-[#666] hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-all disabled:opacity-30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 text-[10px] uppercase tracking-[0.15em] text-[#444]">
                      {log.url && (
                        <span className="truncate max-w-[180px]" title={log.url}>
                          {new URL(log.url).pathname}
                        </span>
                      )}
                      <span>{timeAgo(log.createdAt)}</span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1.5 text-[#666] hover:text-[#e8e8e8] transition-colors"
                      >
                        <Filter className="w-3 h-3" strokeWidth={1} /> DETAILS
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {log.stack && (
                          <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#444] mb-2">STACK TRACE</p>
                            <pre className="text-[11px] text-[#666] bg-[#0a0a0a] rounded-none p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-40 border border-[#1a1a1a]">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                        {log.metadata && (
                          <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#444] mb-2">METADATA</p>
                            <pre className="text-[11px] text-[#666] bg-[#0a0a0a] rounded-none p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-[#1a1a1a]">
                              {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.userAgent && (
                          <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#444] mb-1">USER AGENT</p>
                            <p className="text-[11px] text-[#666] font-mono">{log.userAgent}</p>
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
            className="flex items-center gap-2 h-11 px-5 rounded-none bg-[#0f0f0f] border border-[#1a1a1a] text-[9px] uppercase tracking-[0.2em] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1} /> PREV
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#444] px-4">{page} / {pages}</span>
          <button
            onClick={() => { const p = Math.min(pages, page + 1); setPage(p); fetchLogs(p) }}
            disabled={page >= pages}
            className="flex items-center gap-2 h-11 px-5 rounded-none bg-[#0f0f0f] border border-[#1a1a1a] text-[9px] uppercase tracking-[0.2em] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT <ChevronRight className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>
      )}
    </div>
  )
}
