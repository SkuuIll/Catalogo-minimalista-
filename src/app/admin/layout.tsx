'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package, FolderOpen, Settings, BarChart2, AlertTriangle, Star,
  LogOut, Eye, ChevronRight, X, Menu, Zap, TrendingUp
} from 'lucide-react'

const navItems = [
  { href: '/admin',              label: 'Dashboard',    icon: BarChart2,   color: 'text-[oklch(65%_0.18_260)]' },
  { href: '/admin?tab=products', label: 'Productos',    icon: Package,     color: 'text-[--accent]' },
  { href: '/admin/categories',   label: 'Categorías',   icon: FolderOpen,  color: 'text-[oklch(60%_0.20_155)]' },
  { href: '/admin/reviews',      label: 'Reviews',      icon: Star,        color: 'text-[--amber]' },
  { href: '/admin/logs',         label: 'Logs',         icon: AlertTriangle, color: 'text-[--red]' },
  { href: '/admin/settings',     label: 'Configuración', icon: Settings,   color: 'text-[--text-secondary]' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href.split('?')[0])
  }

  const currentLabel = navItems.find(n => isActive(n.href))?.label || 'Admin'

  return (
    <div className="min-h-screen bg-[--bg] flex text-[--text]">

      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[--bg-surface] border-r border-[--border] flex flex-col transition-transform duration-300 ease-[--ease-expo] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo bar */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[--accent] to-[oklch(63%_0.17_42)] shadow-md shadow-[--accent-glow]">
              <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-extrabold text-[13px] text-[--text] tracking-tight leading-none block">ADMIN</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[--text-tertiary] mt-0.5">Panel de control</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] transition-all"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-6 pb-2">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[--text-tertiary]">Menú</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-6 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold tracking-wide transition-all duration-200 group ${
                  active
                    ? 'bg-[--accent-soft] text-[--accent]'
                    : 'text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  active ? 'bg-[--accent]/20' : 'bg-[--bg-elevated] group-hover:bg-[--border]'
                }`}>
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[--accent]' : item.color}`} strokeWidth={active ? 2.25 : 1.75} />
                </div>
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[--accent]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-4 border-t border-[--border] space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text] transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-lg bg-[--bg-elevated] group-hover:bg-[--border] flex items-center justify-center transition-all">
              <Eye className="w-3.5 h-3.5 text-[oklch(60%_0.20_155)]" strokeWidth={1.75} />
            </div>
            Ver catálogo
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-[--text-secondary] hover:bg-[--red]/8 hover:text-[--red] transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[--bg-elevated] group-hover:bg-[--red]/10 flex items-center justify-center transition-all">
                <LogOut className="w-3.5 h-3.5 text-[--red]" strokeWidth={1.75} />
              </div>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 nav-glass border-b border-[--border] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-[--border] transition-all"
            >
              <Menu className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-[--text-secondary]">
              <span>Panel</span>
              <ChevronRight className="w-3 h-3 opacity-40" strokeWidth={2} />
              <span className="text-[--text]">{currentLabel}</span>
            </div>
          </div>

          {/* Top bar right — quick actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-full bg-[--bg-elevated] border border-[--border] text-[11px] font-semibold text-[--text-secondary] hover:text-[--text] transition-all"
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
              Ver sitio
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 flex-1 bg-[--bg]">
          {children}
        </main>
      </div>
    </div>
  )
}