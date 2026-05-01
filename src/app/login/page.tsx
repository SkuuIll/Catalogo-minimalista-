'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Credenciales inválidas')
      }
      showToast('Bienvenido al panel', 'success')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1714] flex flex-col noise-bg">
      <div className="px-4 pt-4 relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la tienda
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 -mt-8 relative z-10">
        <div className="w-full max-w-xs">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-sm bg-[#2A2520] border border-[#2E2925] flex items-center justify-center mx-auto mb-5">
              <Lock className="w-6 h-6 text-[#C9A55A]" />
            </div>
            <h1 className="font-serif text-2xl font-light text-[#F0EAE0] tracking-[0.02em]">Panel de Administración</h1>
            <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-[#8A8278]">Secure Administrative Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-[11px] uppercase tracking-[0.12em] text-[#C9A55A] mb-2">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#3D3830] h-11 pl-0 pr-4 text-[13px] text-[#F0EAE0] placeholder-[#8A8278]/30 focus:outline-none focus:border-[#C9A55A] transition-colors"
                />
              </div>
              <div className="relative">
                <label className="block text-[11px] uppercase tracking-[0.12em] text-[#C9A55A] mb-2">Contraseña</label>
                <div className="flex items-center border-b border-[#3D3830] focus-within:border-[#C9A55A] transition-colors">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-transparent h-11 pr-10 text-[13px] text-[#F0EAE0] placeholder-[#8A8278]/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#8A8278] hover:text-[#F0EAE0] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[12px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#C9A55A]/20 border-t-[#C9A55A] rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#2E2925] text-center">
            <Link href="/" className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300">
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}