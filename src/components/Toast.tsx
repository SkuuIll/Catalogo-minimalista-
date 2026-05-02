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
            className="pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-sm border backdrop-blur-xl shadow-2xl shadow-black/40 animate-fade-up"
            style={{
              backgroundColor: toast.type === 'error' ? 'rgba(192, 57, 43, 0.12)' : toast.type === 'success' ? 'rgba(60, 179, 113, 0.12)' : 'rgba(201, 165, 90, 0.12)',
              borderColor: toast.type === 'error' ? 'rgba(192, 57, 43, 0.25)' : toast.type === 'success' ? 'rgba(60, 179, 113, 0.25)' : 'rgba(201, 165, 90, 0.25)',
            }}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[--green] flex-shrink-0" strokeWidth={1.5} />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-[--red] flex-shrink-0" strokeWidth={1.5} />}
            {toast.type === 'info' && <AlertCircle className="w-4 h-4 text-[--accent] flex-shrink-0" strokeWidth={1.5} />}
            <span className="text-[13px] text-[--text]/90 font-medium flex-1 leading-snug">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 text-[--text-secondary]/40 hover:text-[--text-secondary] transition-colors duration-200">
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
