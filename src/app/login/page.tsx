'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock } from 'lucide-react'
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto mb-6 text-[#c9a55a]/80">
            <Lock className="w-12 h-12" strokeWidth={1} />
          </div>
          <h1 className="font-serif text-3xl font-light text-[#e8e8e8] tracking-[0.2em] mb-2">
            MAISON D'OR
          </h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#666] mb-1">
            EST. 1992
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#444] mt-8">
            Secure Administrative Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#666] mb-3">
                Username
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[#2a2a2a] h-12 px-0 text-[14px] text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#c9a55a]/50 transition-colors tracking-[0.1em]"
                placeholder=""
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#666] mb-3">
                Password
              </label>
              <div className="flex items-center border-b border-[#2a2a2a] focus-within:border-[#c9a55a]/50 transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-transparent h-12 pr-10 text-[14px] text-[#e8e8e8] placeholder-[#444] focus:outline-none tracking-[0.1em]"
                  placeholder=""
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#444] hover:text-[#666] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1} /> : <Eye className="w-4 h-4" strokeWidth={1} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 border border-[#c9a55a] bg-transparent text-[#c9a55a] text-[11px] uppercase tracking-[0.3em] font-light hover:bg-[#c9a55a] hover:text-[#0a0a0a] active:scale-[0.995] transition-all duration-300 disabled:opacity-30"
          >
            {loading ? 'Accessing...' : 'Enter'}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-16">
          <Link href="/" className="text-[9px] uppercase tracking-[0.2em] text-[#444] hover:text-[#666] transition-colors duration-300">
            ← Return to Catalog
          </Link>
        </div>
      </div>
    </div>
  )
}