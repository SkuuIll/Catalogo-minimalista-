'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
        <span className="font-serif text-4xl font-bold text-primary">404</span>
      </div>
      <h1 className="font-serif text-2xl font-medium text-on-surface mb-2">Página no encontrada</h1>
      <p className="text-sm text-on-surface-variant/60 max-w-xs mb-8 leading-relaxed">
        La página que buscas no existe o ha sido movida a otra ubicación.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/10"
        >
          <Home className="w-4 h-4" />
          Ir al inicio
        </Link>
        <button
          onClick={() => history.back()}
          className="flex items-center justify-center gap-2 px-6 py-3 glass-strong border border-white/[0.06] text-on-surface rounded-xl text-sm font-semibold hover:border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver atrás
        </button>
      </div>
    </div>
  )
}
