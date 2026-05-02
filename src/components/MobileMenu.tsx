'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Compass, Search, Lock, Zap } from 'lucide-react'

const MENU_ITEMS = [
  { href: '/',        label: 'Colección',  sub: 'Todos los productos', icon: Home,    color: 'text-[--accent] bg-[--accent-soft]' },
  { href: '/explore', label: 'Categorías', sub: 'Explorar por sección', icon: Compass, color: 'text-[oklch(65%_0.18_260)] bg-[oklch(65%_0.18_260)/0.12]' },
  { href: '/search',  label: 'Buscar',     sub: 'Encontrá tu producto', icon: Search,  color: 'text-[--green] bg-[--green]/10' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-transparent hover:border-[--border] transition-all duration-200"
        aria-label="Abrir menú"
      >
        <Menu className="w-[17px] h-[17px]" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute inset-0 z-[90]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={close}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[--bg-surface] border-t border-[--border] rounded-t-3xl animate-slide-up shadow-xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[--border-mid]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[--accent] to-[oklch(63%_0.17_42)] flex items-center justify-center shadow-md shadow-[--accent-glow]">
                  <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-[14px] text-[--text] tracking-tight">Menú</span>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[--text-tertiary] hover:text-[--text] hover:bg-[--bg-elevated] border border-[--border] transition-all duration-200"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="px-4 pb-3 space-y-1">
              {MENU_ITEMS.map(({ href, label, sub, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-[--bg-elevated] active:bg-[--bg-elevated] transition-all duration-150 press group"
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${color} shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[14px] font-bold text-[--text] leading-tight">{label}</span>
                    {sub && <span className="block text-[11px] text-[--text-tertiary] mt-0.5">{sub}</span>}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[--bg-elevated] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4H6.5M4 1.5L6.5 4L4 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[--text-tertiary]"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-4 my-1 border-t border-[--border]" />

            {/* Admin link */}
            <div className="px-4 pb-5 pt-2">
              <Link
                href="/login"
                onClick={close}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-[--accent-soft] border border-[--accent]/20 hover:bg-[--accent-soft] active:scale-[0.98] transition-all duration-150 press group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[--accent] to-[oklch(63%_0.17_42)] shadow-md shadow-[--accent-glow]">
                  <Lock className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <span className="block text-[14px] font-bold text-[--accent]">Panel Admin</span>
                  <span className="text-[11px] text-[--accent]/60">Gestionar catálogo</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
