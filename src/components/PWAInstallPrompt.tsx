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
      <div className="bg-[#161310] border border-[#2E2925] rounded-sm p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#C9A55A]/10 border border-[#C9A55A]/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-[#C9A55A]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-light text-[#F0EAE0] tracking-[0.02em]">Instalar app</h4>
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] mt-0.5">Acceso rápido desde tu pantalla de inicio.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleInstall} className="h-9 px-4 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.97] transition-all duration-300">
                Instalar
              </button>
              <button onClick={() => setShow(false)} className="h-9 px-4 rounded-sm text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300">
                Ahora no
              </button>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="p-1 text-[#8A8278]/30 hover:text-[#8A8278] transition-colors duration-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
