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
        className="sm:hidden p-1.5 -mr-1.5 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300"
        aria-label="Menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] sm:hidden">
          <div
            className="absolute inset-0 bg-[#1A1714]/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#221E1A]/98 backdrop-blur-2xl rounded-t-3xl border-t border-[#2E2925] animate-fade-up">
            <div className="flex justify-end p-3">
              <button onClick={() => setOpen(false)} className="p-2 -mr-1 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300">
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
      className={`block p-3 rounded-sm transition-colors duration-300 ${accent ? 'bg-[#2A2520] text-[#C9A55A]' : 'text-[#F0EAE0]/70 hover:text-[#F0EAE0] hover:bg-white/[0.02]'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      {subtitle && <span className="block text-[11px] uppercase tracking-[0.15em] text-[#8A8278] mt-0.5">{subtitle}</span>}
    </Link>
  )
}
