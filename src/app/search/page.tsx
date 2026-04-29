'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { formatARS } from '@/lib/format'
import { BottomNav } from '@/components/BottomNav'
import { MobileMenu } from '@/components/MobileMenu'
import { Search, ArrowLeft, Package, X, Clock } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try { setRecent(JSON.parse(saved).slice(0, 8)) } catch {}
    }
  }, [])

  // Save to recent searches with debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return
    const timer = setTimeout(() => {
      setRecent(prev => {
        const q = query.trim()
        if (prev.includes(q)) return prev
        const next = [q, ...prev].slice(0, 8)
        localStorage.setItem('recentSearches', JSON.stringify(next))
        return next
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [query])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    )
  }, [query, products])

  const clearRecent = () => {
    setRecent([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div className="min-h-screen bg-[#060606] pb-16">
      {/* Header with integrated search */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2.5 h-11 px-3">
          <Link href="/" className="p-1.5 text-white/40 hover:text-white/70 transition-colors rounded-lg flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar productos…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl h-9 pl-10 pr-9 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-white/25 hover:text-white/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <MobileMenu />
        </div>
      </header>

      <div className="h-11" />

      <main className="px-4 pt-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
            <p className="text-white/30 text-sm mt-3">Cargando catálogo…</p>
          </div>

        ) : query.trim() ? (
          /* Search results */
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                {results.length > 0 ? `"${query}"` : 'Sin resultados'}
              </h2>
              <span className="text-xs text-white/30">{results.length} encontrados</span>
            </div>

            {results.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm font-medium">Sin resultados para "{query}"</p>
                <p className="text-white/25 text-xs mt-1.5">Probá con otro término o revisá la categoría</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-4 text-xs text-[#bf9b4e]/70 hover:text-[#bf9b4e] transition-colors"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {results.map(p => <SearchProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>

        ) : (
          /* Empty state — show recents + catalog preview */
          <>
            {recent.length > 0 && (
              <section className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Búsquedas recientes</h2>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-white/25 hover:text-white/50 transition-colors"
                  >
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map(t => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d0d0d] border border-[#1a1a1a] text-sm text-white/40 hover:text-white/70 hover:border-white/10 transition-all"
                    >
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-4">Catálogo</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.slice(0, 12).map(p => <SearchProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function SearchProductCard({ product }: { product: any }) {
  let imgs: string[] = []
  try { if (product.images) imgs = JSON.parse(product.images) } catch {}
  const img = imgs[0] || product.imagePath || product.imageUrl

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col active:scale-[0.97] transition-transform">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2.5 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/20 transition-all duration-500">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover product-img-hover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-white/10" />
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-snug">{product.name}</h3>
      <span className="text-sm font-semibold text-[#bf9b4e] mt-1">{formatARS(product.price)}</span>
    </Link>
  )
}
