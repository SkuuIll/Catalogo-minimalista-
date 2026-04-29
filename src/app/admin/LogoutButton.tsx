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
      className="flex items-center gap-1.5 text-[11px] font-medium text-white/25 hover:text-[#e05555] transition-colors"
    >
      <LogOut className="w-3 h-3" />
      <span className="hidden sm:inline">Salir</span>
    </button>
  )
}
