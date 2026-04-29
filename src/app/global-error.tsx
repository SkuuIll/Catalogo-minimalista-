'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-error/5 border border-error/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-error/60" />
        </div>
        <h1 className="font-serif text-2xl font-medium text-on-surface mb-2">Algo salió mal</h1>
        <p className="text-sm text-on-surface-variant/60 max-w-xs mb-2 leading-relaxed">
          Ha ocurrido un error inesperado. Inténtalo de nuevo.
        </p>
        {error.digest && (
          <p className="text-[10px] text-on-surface-variant/30 font-mono mb-8">Ref: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 glass-strong border border-white/[0.06] text-on-surface rounded-xl text-sm font-semibold hover:border-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>
      </body>
    </html>
  )
}
