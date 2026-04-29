'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3X3, User, Search } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden">
      <div className="glass-strong border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-14">
          <NavItem href="/" active={isActive('/')} icon={<Home className="w-5 h-5" />} label="Inicio" />
          <NavItem href="/explore" active={isActive('/explore')} icon={<Grid3X3 className="w-5 h-5" />} label="Explorar" />
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
      className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
        active ? 'text-primary' : 'text-on-surface-variant/60'
      }`}
    >
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </Link>
  )
}
