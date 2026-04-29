'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Search, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || (path === '/' && pathname === '/')

  // No mostrar en páginas de detalle de producto (tienen su propia action bar)
  if (pathname.startsWith('/product/')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden">
      <div className="glass border-t border-[#1a1a1a] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-12">
          <NavItem href="/" active={isActive('/')} icon={<Home className="w-5 h-5" />} label="Inicio" />
          <NavItem href="/explore" active={isActive('/explore')} icon={<Compass className="w-5 h-5" />} label="Explorar" />
          <NavItem href="/search" active={isActive('/search')} icon={<Search className="w-5 h-5" />} label="Buscar" />
          <NavItem href="/login" active={isActive('/login')} icon={<User className="w-5 h-5" />} label="Cuenta" />
        </div>
      </div>
    </nav>
  )
}

function NavItem({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-200 ${active ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
    >
      {active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-accent" />
      )}
      {icon}
      <span className="text-[9px] font-medium tracking-tight">{label}</span>
    </Link>
  )
}
