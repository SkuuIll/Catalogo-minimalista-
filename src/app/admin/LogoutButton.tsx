'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-error/70 hover:text-error transition-colors"
    >
      <LogOut className="w-3 h-3" />
      <span className="hidden sm:inline">Cerrar Sesión</span>
    </button>
  )
}
