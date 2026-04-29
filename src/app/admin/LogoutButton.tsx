'use client'

import { useRouter } from 'next/navigation'

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
      className="text-[12px] font-bold uppercase tracking-[0.15em] text-error hover:text-[#ffdad6] transition-colors"
    >
      Sign Out
    </button>
  )
}
