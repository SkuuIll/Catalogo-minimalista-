'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[--bg] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[--accent]/8 to-transparent blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-up">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[--accent] to-[oklch(63%_0.17_42)] flex items-center justify-center shadow-lg shadow-[--accent-glow] mb-8">
          <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>

        {/* 404 number */}
        <p className="font-display font-extrabold text-[80px] md:text-[100px] leading-none gradient-text tracking-[-0.04em] mb-0">
          404
        </p>

        <h1 className="font-display font-bold text-[22px] md:text-[26px] text-[--text] tracking-tight mb-3 mt-2">
          Página no encontrada
        </h1>
        <p className="text-[13px] md:text-[14px] text-[--text-secondary] max-w-[300px] leading-relaxed mb-10">
          Esta página no existe o fue movida. Volvé al inicio para seguir explorando el catálogo.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[300px]">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r from-[--accent] to-[oklch(63%_0.17_42)] text-white text-[13px] font-bold tracking-wide hover:opacity-92 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[--accent-glow] press flex-1"
          >
            <Home className="w-4 h-4" strokeWidth={2.5} />
            Ir al inicio
          </Link>
          <button
            onClick={() => history.back()}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[--bg-surface] border border-[--border] text-[--text-secondary] text-[13px] font-semibold hover:text-[--text] hover:border-[--border-mid] active:scale-[0.97] transition-all duration-200 press flex-1"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
