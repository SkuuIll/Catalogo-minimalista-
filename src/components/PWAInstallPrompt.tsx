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
    <div className="fixed bottom-16 left-3 right-3 z-[80] sm:hidden">
      <div className="glass border border-[#1a1a1a] rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#bf9b4e]/10 border border-[#bf9b4e]/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-[#bf9b4e]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">Instalar app</h4>
            <p className="text-[11px] text-white/40 mt-0.5">Acceso rápido desde tu pantalla de inicio.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleInstall} className="h-9 px-4 rounded-xl bg-white text-black text-[11px] font-semibold hover:bg-white/90 active:scale-[0.97] transition-all">
                Instalar
              </button>
              <button onClick={() => setShow(false)} className="h-9 px-4 rounded-xl text-[11px] text-white/40 hover:text-white/70 transition-colors">
                Ahora no
              </button>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="p-1 text-white/15 hover:text-white/40">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
