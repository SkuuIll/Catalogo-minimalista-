'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Leaf, Search, Settings } from 'lucide-react'

const TABS = [
  { href: '/',        label: 'Home',     icon: Home     },
  { href: '/explore', label: 'Explore',  icon: Leaf     },
  { href: '/search',  label: 'Buscar',   icon: Search   },
  { href: '/login',   label: 'Admin',    icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/product/')) return null

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className="sticky bottom-0 z-[70] nav-glass border-t border-[--border] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-stretch h-[56px]">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-[3px] flex-1 transition-all duration-200 press ${
                  active ? 'text-[--accent]' : 'text-[--text-tertiary]'
                }`}
              >
                {/* Active pill bg */}
                {active && (
                  <span className="absolute inset-x-2 top-2 bottom-2 rounded-2xl bg-[--accent-soft]" />
                )}
                <span className="relative z-10 flex flex-col items-center gap-[3px]">
                  <Icon
                    className={`transition-all duration-200 ${active ? 'w-[20px] h-[20px]' : 'w-[18px] h-[18px]'}`}
                    strokeWidth={active ? 2.25 : 1.5}
                  />
                  <span className={`text-[9px] font-bold tracking-[0.05em] transition-all duration-200 ${active ? 'opacity-100' : 'opacity-50'}`}>
                    {label}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop tab bar — hidden, handled by header */}
    </>
  )
}
