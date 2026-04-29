'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Shield, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 sm:pt-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al catálogo
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 pb-8 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-lg shadow-primary/5">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-on-surface text-center">
              Bienvenido
            </h1>
            <p className="mt-2 text-center text-sm text-on-surface-variant/60">
              Inicia sesión para acceder al panel de administración
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error/10 border border-error/20 p-3 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <p className="text-xs text-error font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/35" />
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder-on-surface-variant/35 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/35" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-12 text-sm text-on-surface placeholder-on-surface-variant/35 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/35 hover:text-on-surface-variant transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-container to-[#8E6E37] text-sm font-semibold text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 shadow-lg shadow-primary/10 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-on-surface-variant/30">
              Credenciales protegidas. Acceso exclusivo para administradores.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
