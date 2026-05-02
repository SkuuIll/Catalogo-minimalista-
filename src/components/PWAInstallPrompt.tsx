'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!window.matchMedia('(display-mode: standalone)').matches) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
    setShow(false)
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-[72px] left-4 right-4 z-[80] sm:hidden animate-slide-up">
      <div className="bg-[--bg-elevated]/95 backdrop-blur-xl border border-[--border] rounded-2xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[--accent-soft] flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-[--accent]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-[14px] text-[--text] tracking-tight">App Disponible</h4>
            <p className="text-[11px] font-medium text-[--text-tertiary] mt-0.5">Añadila a tu pantalla de inicio.</p>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={handleInstall} className="flex-1 h-9 rounded-xl bg-[--accent] text-[--bg] text-[12px] font-bold tracking-wide hover:opacity-90 active:scale-[0.97] transition-all duration-300">
                Instalar
              </button>
              <button onClick={() => setShow(false)} className="px-4 h-9 rounded-xl bg-[--bg-surface] border border-[--border] text-[11px] font-bold text-[--text-secondary] hover:text-[--text] active:bg-[--bg] transition-all duration-300">
                Ahora no
              </button>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="p-1 -mr-1 text-[--text-tertiary] hover:text-[--text] transition-colors duration-300">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
