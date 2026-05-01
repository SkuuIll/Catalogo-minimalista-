'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const variantStyles = {
    danger: { bg: 'bg-[#C0392B]/10', border: 'border-[#C0392B]/30', text: 'text-[#C0392B]', btn: 'bg-[#C0392B] hover:bg-[#C0392B]/90' },
    warning: { bg: 'bg-[#C9A55A]/10', border: 'border-[#C9A55A]/30', text: 'text-[#C9A55A]', btn: 'bg-[#C9A55A] hover:bg-[#C9A55A]/90' },
    info: { bg: 'bg-[#C9A55A]/10', border: 'border-[#C9A55A]/30', text: 'text-[#C9A55A]', btn: 'bg-[#C9A55A] hover:bg-[#C9A55A]/90' },
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm bg-[#221E1A] border border-[#2E2925] rounded-3xl p-6 shadow-2xl shadow-black/50 animate-fade-up"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-12 h-12 rounded-2xl ${styles.bg} border ${styles.border} flex items-center justify-center mb-4`}>
          <svg className={`w-6 h-6 ${styles.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-[13px] text-white/50 leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-[#2A2520] border border-[#2E2925] text-[13px] font-medium text-white/60 hover:text-white hover:border-white/10 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-xl ${styles.btn} text-[13px] font-semibold text-black active:scale-[0.98] transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DeleteDialogProps {
  open: boolean
  itemName: string
  itemType?: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({ open, itemName, itemType = 'elemento', onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={`Eliminar ${itemType}`}
      message={`¿Estás seguro de que querés eliminar "${itemName}"? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

interface SuccessDialogProps {
  open: boolean
  title: string
  message: string
  onClose: () => void
}

export function SuccessDialog({ open, title, message, onClose }: SuccessDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={message}
      confirmText="Entendido"
      variant="info"
      onConfirm={onClose}
      onCancel={onClose}
    />
  )
}