'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, ArrowLeft, Zap, ShieldCheck } from 'lucide-react'
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
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[--bg] flex flex-col selection:bg-[--accent-soft]">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[--accent]/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[oklch(65%_0.18_260)/0.08] to-transparent blur-3xl" />
        <div className="absolute inset-0 hero-grid opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-14 flex items-center px-4 max-w-lg w-full mx-auto">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-surface] border border-[--border] transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </Link>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-20 max-w-sm w-full mx-auto">

        {/* Logo block */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[--accent] to-[oklch(63%_0.17_42)] shadow-lg shadow-[--accent-glow]">
              <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-extrabold text-[15px] text-[--text] tracking-tight block leading-none">SHOWROOM JR</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[--text-tertiary] mt-0.5 block">Admin Panel</span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-[28px] md:text-[32px] text-[--text] tracking-[-0.025em] leading-tight mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-[13px] text-[--text-secondary] leading-relaxed">
            Ingresá tus credenciales para administrar el catálogo.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[--bg-surface] border border-[--border] rounded-3xl p-6 shadow-xl animate-fade-up delay-1">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[--text-secondary] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[--bg-elevated] border border-[--border] rounded-xl h-12 px-4 text-[14px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent] focus:bg-[--bg-surface] transition-all duration-200"
                placeholder="admin@showjr.store"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[--text-secondary] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[--bg-elevated] border border-[--border] rounded-xl h-12 pl-4 pr-12 text-[14px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent] focus:bg-[--bg-surface] transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-lg text-[--text-tertiary] hover:text-[--text-secondary] hover:bg-[--bg-elevated] transition-all"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                    : <Eye className="w-4 h-4" strokeWidth={1.75} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[--accent] to-[oklch(63%_0.17_42)] text-white text-[13px] font-extrabold tracking-wide hover:opacity-92 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[--accent-glow] mt-2 press"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" strokeWidth={2.5} />
                  Ingresar al panel
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 animate-fade-up delay-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[--green]" strokeWidth={2} />
          <p className="text-[11px] text-[--text-tertiary]">
            Conexión segura · Solo personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}