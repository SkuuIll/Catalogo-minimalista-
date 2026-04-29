'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-1.5 -mr-1.5 text-white/50 hover:text-white transition-colors"
        aria-label="Menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d]/98 backdrop-blur-2xl rounded-t-3xl border-t border-[#1a1a1a] animate-fade-up">
            <div className="flex justify-end p-3">
              <button onClick={() => setOpen(false)} className="p-2 -mr-1 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-6 pb-10 space-y-3">
              <MenuItem href="/" onClick={() => setOpen(false)} label="Catálogo" subtitle="Todos los productos" />
              <MenuItem href="/explore" onClick={() => setOpen(false)} label="Explorar" subtitle="Categorías" />
              <MenuItem href="/search" onClick={() => setOpen(false)} label="Buscar" />
              <div className="pt-3">
                <MenuItem href="/login" onClick={() => setOpen(false)} label="Iniciar Sesión" accent />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function MenuItem({ href, onClick, label, subtitle, accent }: { href: string; onClick: () => void; label: string; subtitle?: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block p-3 rounded-2xl transition-colors ${accent ? 'bg-[#1a1a1a] text-[#bf9b4e] font-medium' : 'text-white/70 hover:text-white hover:bg-white/[0.04]'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      {subtitle && <span className="block text-[11px] text-white/30 mt-0.5">{subtitle}</span>}
    </Link>
  )
}
