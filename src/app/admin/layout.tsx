'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package, FolderOpen, Settings, BarChart2, AlertTriangle,
  LogOut, Eye, ChevronRight, X, Menu
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin?tab=products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: FolderOpen },
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
    <div className="min-h-screen bg-[#1A1714] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#161310] border-r border-[#2E2925] flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[#2E2925]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#C9A55A] flex items-center justify-center">
              <span className="font-serif text-sm font-light text-[#1A1714]">A</span>
            </div>
            <div>
              <span className="font-serif text-sm font-light text-[#F0EAE0] tracking-[0.02em]">Admin</span>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]">Panel de gestión</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-sm text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-0 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-normal transition-all duration-300 border-l-2 ${
                  active
                    ? 'bg-[#C9A55A]/10 border-[#C9A55A] text-[#C9A55A]'
                    : 'border-transparent text-[#8A8278] hover:text-[#F0EAE0]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-0 py-4 border-t border-[#2E2925] space-y-0.5">
          <Link href="/" className="flex items-center gap-3 px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-normal text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 border-l-2 border-transparent">
            <Eye className="w-4 h-4" />
            Ver tienda
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-normal text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 border-l-2 border-transparent">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#161310] border-b border-[#2E2925] flex items-center px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-sm text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#8A8278] ml-2 lg:ml-0">
            <span>Aura</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#F0EAE0]/60">
              {navItems.find(n => isActive(n.href))?.label || 'Admin'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}