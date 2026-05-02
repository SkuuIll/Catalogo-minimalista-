'use client'

import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WhatsAppButton({ number, message }: { number: string; message?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!number) return null

  const cleanNumber = number.replace(/\D/g, '')
  const waMessage = message ? encodeURIComponent(message) : encodeURIComponent('Hola! Quisiera hacer una consulta.')
  const waLink = `https://wa.me/${cleanNumber}?text=${waMessage}`

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className={`fixed bottom-20 right-4 z-[60] w-12 h-12 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 hover:bg-[#1ebe5d] hover:scale-105 active:scale-95 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <MessageCircle className="w-5 h-5" strokeWidth={2} />
    </a>
  )
}
