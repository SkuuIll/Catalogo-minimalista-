'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden p-2 -mr-2 text-on-surface"
        aria-label="Menú"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-surface border-l border-white/10 p-6 flex flex-col gap-6 animate-fade-in-up">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="p-2 text-on-surface-variant">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setOpen(false)} className="text-lg font-medium text-on-surface hover:text-primary transition-colors">
                Catálogo
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)} className="text-lg font-medium text-on-surface hover:text-primary transition-colors">
                Panel Admin
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="text-lg font-medium text-primary">
                Iniciar Sesión
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
