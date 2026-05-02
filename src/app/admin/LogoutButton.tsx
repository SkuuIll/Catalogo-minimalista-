'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useToast } from '@/components/Toast'

export function LogoutButton() {
  const router = useRouter()
  const { showToast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      showToast('Sesión cerrada', 'success')
      router.push('/login')
      router.refresh()
    } catch {
      showToast('Error al cerrar sesión', 'error')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-[11px] font-medium text-white/25 hover:text-[--red] transition-colors"
    >
      <LogOut className="w-3 h-3" />
      <span className="hidden sm:inline">Salir</span>
    </button>
  )
}