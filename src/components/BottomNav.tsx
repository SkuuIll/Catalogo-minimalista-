'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Search, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || (path === '/' && pathname === '/')

  if (pathname.startsWith('/product/')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden">
      <div className="bg-[#161310]/95 backdrop-blur-md border-t border-[#2E2925]/60 pb-[env(safe-area-inset-bottom)]">
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
      className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors duration-300 ${active ? 'text-[#C9A55A]' : 'text-[#8A8278] hover:text-[#F0EAE0]'}`}
    >
      {active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-[2px] rounded-full bg-[#C9A55A]" />
      )}
      {icon}
      <span className="text-[9px] font-normal tracking-[0.15em] uppercase">{label}</span>
    </Link>
  )
}
