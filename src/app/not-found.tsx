'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-6">
        <span className="font-serif text-3xl font-medium text-white/40">404</span>
      </div>
      <h1 className="font-serif text-xl font-medium text-white mb-1.5">Página no encontrada</h1>
      <p className="text-[13px] text-white/30 max-w-xs mb-8">Parece que esta página no existe o fue movida.</p>
      <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[280px]">
        <Link href="/" className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all">
          <Home className="w-4 h-4" />
          Inicio
        </Link>
        <button onClick={() => history.back()} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#111] border border-[#1a1a1a] text-white/60 text-[13px] font-semibold hover:text-white hover:border-white/10 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    </div>
  )
}
