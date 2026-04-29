'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        throw new Error(data.error || 'Authentication failed')
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
    <div className="min-h-screen flex items-center justify-center bg-background px-5 sm:px-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-bright/20 via-background to-background pointer-events-none" />

      <div className="max-w-md w-full glass p-10 rounded-lg border border-white/5 relative z-10">
        <div>
          <h2 className="font-serif text-[32px] font-medium text-center text-on-surface">
            Secure Access
          </h2>
          <p className="mt-3 text-center text-[16px] text-on-surface-variant font-sans">
            Authentication required for registry management.
          </p>
        </div>
        <form className="mt-10 space-y-8" onSubmit={handleLogin}>
          {error && (
            <div className="bg-error-container/20 border border-error/50 p-4 rounded text-center">
              <p className="text-[14px] text-error font-sans">{error}</p>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary text-[16px] text-on-surface placeholder-on-surface-variant transition-colors"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary text-[16px] text-on-surface placeholder-on-surface-variant transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded bg-gradient-to-r from-primary-container to-[#8E6E37] text-[14px] font-semibold tracking-[0.05em] text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </div>
        </form>
        <div className="text-center mt-8">
            <Link href="/" className="text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
              Return to Catalog
            </Link>
        </div>
      </div>
    </div>
  )
}
