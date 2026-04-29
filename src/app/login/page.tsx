'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error de autenticación')
      }
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col">
      <div className="px-4 pt-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 -mt-8">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white/50" />
            </div>
            <h1 className="font-serif text-xl font-medium text-white">Iniciar sesión</h1>
            <p className="mt-1.5 text-[13px] text-white/30">Panel de administración</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            {error && (
              <div className="bg-[#e05555]/5 border border-[#e05555]/15 p-3 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#e05555] flex-shrink-0" />
                <p className="text-[11px] text-[#e05555]">{error}</p>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-12 pl-10 pr-4 text-[13px] text-white placeholder-white/25 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-12 pl-10 pr-10 text-[13px] text-white placeholder-white/15 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/15 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-[#060606] text-[13px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#060606]/20 border-t-[#060606] rounded-full animate-spin" />
                  Autenticando
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-[11px] text-white/35">
            Acceso exclusivo para administradores
          </p>
        </div>
      </div>
    </div>
  )
}
