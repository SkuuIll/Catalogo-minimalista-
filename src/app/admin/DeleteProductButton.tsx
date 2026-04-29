'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Error al eliminar el producto')
      }
    } catch (e) {
      console.error(e)
      alert('Error de conexión')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs sm:text-sm font-semibold tracking-[0.05em] text-error hover:text-[#ffdad6] border border-error/30 hover:border-error/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
