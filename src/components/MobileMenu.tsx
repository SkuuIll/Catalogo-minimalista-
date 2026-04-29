'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Grid3X3, User, Shield } from 'lucide-react'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden p-2 -mr-2 text-on-surface hover:text-primary transition-colors"
        aria-label="Menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-surface/95 backdrop-blur-xl border-l border-white/[0.06] p-6 flex flex-col"
            style={{
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-serif text-lg text-primary">Menú</span>
              <button onClick={() => setOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLink href="/" icon={<Home className="w-4 h-4" />} onClick={() => setOpen(false)}>Catálogo</NavLink>
              <NavLink href="/admin" icon={<Shield className="w-4 h-4" />} onClick={() => setOpen(false)}>Panel Admin</NavLink>
              <NavLink href="/login" icon={<User className="w-4 h-4" />} onClick={() => setOpen(false)} highlight>Iniciar Sesión</NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function NavLink({ href, children, icon, onClick, highlight }: { href: string; children: React.ReactNode; icon: React.ReactNode; onClick?: () => void; highlight?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        highlight
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
