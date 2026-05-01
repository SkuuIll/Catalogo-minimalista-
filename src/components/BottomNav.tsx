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
      <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#1a1a1a] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          <NavItem href="/" active={isActive('/')} icon={<Home className="w-5 h-5" />} label="Home" />
          <NavItem href="/explore" active={isActive('/explore')} icon={<Compass className="w-5 h-5" />} label="Explore" />
          <NavItem href="/search" active={isActive('/search')} icon={<Search className="w-5 h-5" />} label="Search" />
          <NavItem href="/login" active={isActive('/login')} icon={<User className="w-5 h-5" />} label="Account" />
        </div>
      </div>
    </nav>
  )
}

function NavItem({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300 ${active ? 'text-[#c9a55a]' : 'text-[#666] hover:text-[#888]'}`}
    >
      {active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-[#c9a55a]" />
      )}
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-normal uppercase tracking-[0.25em] transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
    </Link>
  )
}
