'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; type: ToastType }

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void
} | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4 sm:w-80">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl shadow-black/50 animate-fade-up"
            style={{
              backgroundColor: toast.type === 'error' ? 'rgba(224, 85, 85, 0.15)' : toast.type === 'success' ? 'rgba(60, 179, 113, 0.15)' : 'rgba(191, 155, 78, 0.15)',
              borderColor: toast.type === 'error' ? 'rgba(224, 85, 85, 0.3)' : toast.type === 'success' ? 'rgba(60, 179, 113, 0.3)' : 'rgba(191, 155, 78, 0.3)',
            }}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#3cb371] flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-[#e05555] flex-shrink-0" />}
            {toast.type === 'info' && <AlertCircle className="w-4 h-4 text-[#bf9b4e] flex-shrink-0" />}
            <span className="text-[13px] text-white font-medium flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 text-white/30 hover:text-white/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}