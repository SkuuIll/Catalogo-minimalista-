'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package, FolderOpen, Settings, BarChart2, AlertTriangle, Star,
  LogOut, Eye, ChevronRight, X, Menu
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin?tab=products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: FolderOpen },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/logs', label: 'Logs', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-[#e8e8e8]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center">
              <span className="font-serif text-xl font-light text-[#c9a55a]">A</span>
            </div>
            <div>
              <span className="font-serif text-[13px] font-light text-[#e8e8e8] tracking-[0.1em]">ADMIN</span>
              <p className="text-[8px] uppercase tracking-[0.25em] text-[#666]">PANEL</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300">
            <X className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-0 py-6 space-y-0 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 text-[9px] uppercase tracking-[0.25em] font-normal transition-all duration-300 border-l ${
                  active
                    ? 'bg-[#0f0f0f] border-[#c9a55a] text-[#c9a55a]'
                    : 'border-transparent text-[#666] hover:text-[#e8e8e8]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-0 py-6 border-t border-[#1a1a1a] space-y-0">
          <Link href="/" className="flex items-center gap-4 px-6 py-3.5 text-[9px] uppercase tracking-[0.25em] font-normal text-[#666] hover:text-[#e8e8e8] transition-colors duration-300 border-l border-transparent">
            <Eye className="w-4 h-4" strokeWidth={1} />
            VIEW STORE
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="w-full flex items-center gap-4 px-6 py-3.5 text-[9px] uppercase tracking-[0.25em] font-normal text-[#666] hover:text-[#e8e8e8] transition-colors duration-300 border-l border-transparent">
              <LogOut className="w-4 h-4" strokeWidth={1} />
              LOGOUT
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300"
          >
            <Menu className="w-5 h-5" strokeWidth={1} />
          </button>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-[#666] ml-2">
            <span>AURA</span>
            <ChevronRight className="w-3 h-3" strokeWidth={1} />
            <span className="text-[#e8e8e8]">
              {navItems.find(n => isActive(n.href))?.label || 'ADMIN'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}