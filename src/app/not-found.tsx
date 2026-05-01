'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1A1714] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#2A2520] border border-[#2E2925] flex items-center justify-center mb-6">
        <span className="font-serif text-3xl font-medium text-white/40">404</span>
      </div>
      <h1 className="font-serif text-xl font-light text-[#F0EAE0] tracking-[0.02em] mb-1.5">Página no encontrada</h1>
      <p className="text-[13px] text-[#8A8278] max-w-xs mb-8">Parece que esta página no existe o fue movida.</p>
      <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[280px]">
        <Link href="/" className="flex items-center justify-center gap-2 h-12 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[13px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300">
          <Home className="w-4 h-4" />
          Inicio
        </Link>
        <button onClick={() => history.back()} className="flex items-center justify-center gap-2 h-12 rounded-sm bg-[#2A2520] border border-[#2E2925] text-[#8A8278] text-[13px] font-normal hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all duration-300">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    </div>
  )
}
