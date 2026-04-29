'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { DeleteDialog } from '@/components/Dialog'
import { useToast } from '@/components/Toast'

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        showToast('Producto eliminado', 'success')
        setShowConfirm(false)
        router.refresh()
      } else {
        showToast(data.error || 'Error al eliminar', 'error')
        setShowConfirm(false)
      }
    } catch {
      showToast('Error de conexión', 'error')
      setShowConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="p-2 rounded-lg text-white/15 hover:text-[#e05555] hover:bg-[#e05555]/5 transition-all disabled:opacity-50"
        title="Eliminar producto"
      >
        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
      <DeleteDialog
        open={showConfirm}
        itemName={name}
        itemType="producto"
        onConfirm={handleDelete}
        onCancel={() => { setShowConfirm(false); setIsDeleting(false) }}
      />
    </>
  )
}

export function ToggleFeaturedButton({ id, featured, onToggle }: { id: string; featured: boolean; onToggle: () => void }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured })
      })
      if (res.ok) {
        showToast(featured ? 'Quitado de destacados' : 'Marcado como destacado', 'success')
        onToggle()
      } else {
        showToast('Error al actualizar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-all ${featured ? 'text-[#bf9b4e] bg-[#bf9b4e]/10 hover:bg-[#bf9b4e]/20' : 'text-white/25 hover:text-[#bf9b4e] hover:bg-[#bf9b4e]/5'} disabled:opacity-50`}
      title={featured ? 'Quitar de destacados' : 'Marcar como destacado'}
    >
      <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
    </button>
  )
}