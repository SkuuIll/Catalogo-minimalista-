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
        className="sm:hidden p-2 -mr-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" strokeWidth={1} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] sm:hidden">
          <div
            className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/98 backdrop-blur-2xl border-t border-[#1a1a1a] animate-fade-up">
            <div className="flex justify-end p-4">
              <button onClick={() => setOpen(false)} className="p-2 -mr-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300">
                <X className="w-5 h-5" strokeWidth={1} />
              </button>
            </div>
            <nav className="px-8 pb-12 space-y-4">
              <MenuItem href="/" onClick={() => setOpen(false)} label="Collection" subtitle="All pieces" />
              <MenuItem href="/explore" onClick={() => setOpen(false)} label="Categories" />
              <MenuItem href="/search" onClick={() => setOpen(false)} label="Search" />
              <div className="pt-4 border-t border-[#1a1a1a]">
                <MenuItem href="/login" onClick={() => setOpen(false)} label="Administrative Access" accent />
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
      className={`block p-4 rounded-none transition-colors duration-300 ${accent ? 'bg-[#0f0f0f] text-[#c9a55a]' : 'text-[#888] hover:text-[#e8e8e8] hover:bg-[#0f0f0f]/30'}`}
    >
      <span className="text-sm font-light tracking-[0.1em]">{label}</span>
      {subtitle && <span className="block text-[9px] uppercase tracking-[0.3em] text-[#666] mt-1">{subtitle}</span>}
    </Link>
  )
}
