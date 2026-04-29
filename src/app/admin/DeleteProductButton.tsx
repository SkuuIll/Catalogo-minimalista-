'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) return

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
      className="inline-flex items-center gap-1.5 text-xs font-medium text-error/70 hover:text-error border border-error/20 hover:border-error/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
    >
      {isDeleting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
