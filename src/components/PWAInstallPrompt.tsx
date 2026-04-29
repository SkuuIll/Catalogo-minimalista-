'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferredPrompt(null)
    setShow(false)
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[80] sm:hidden animate-fade-in-up">
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-on-surface">Instalar Aura</h4>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5 leading-relaxed">
              Agrega esta app a tu pantalla de inicio para un acceso rápido.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar
              </button>
              <button
                onClick={() => setShow(false)}
                className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="p-1 text-on-surface-variant/50 hover:text-on-surface-variant">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
