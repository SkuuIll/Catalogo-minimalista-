'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this artifact?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[14px] font-semibold tracking-[0.05em] text-error hover:text-[#ffdad6] border border-error/30 hover:border-error/60 px-4 py-2 rounded transition-colors disabled:opacity-50"
    >
      {isDeleting ? 'Removing...' : 'Remove'}
    </button>
  )
}
