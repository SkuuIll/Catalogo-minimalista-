'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { formatARS } from '@/lib/format'
import { BottomNav } from '@/components/BottomNav'
import { MobileMenu } from '@/components/MobileMenu'
import { ImageFade } from '@/components/ImageFade'
import { SearchSkeleton } from '@/components/Skeleton'
import { Search, ArrowLeft, Package, X, Clock } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : data.products || []); setLoading(false) })
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try { setRecent(JSON.parse(saved).slice(0, 8)) } catch {}
    }
  }, [])

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
    <div className="min-h-screen bg-[#1A1714] pb-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161310]/95 backdrop-blur-md border-b border-[#2E2925]/60">
        <div className="flex items-center gap-2.5 h-11 px-3 max-w-7xl mx-auto">
          <Link href="/" className="p-1.5 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 rounded-sm flex-shrink-0">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]/30 pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar productos…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-transparent border-b border-[#3D3830] h-9 pl-10 pr-9 text-sm text-[#F0EAE0] placeholder-[#8A8278]/25 focus:outline-none focus:border-[#C9A55A] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <MobileMenu />
        </div>
      </header>

      <div className="h-11" />

      <main className="px-4 pt-5 max-w-7xl mx-auto">
        {loading ? (
          <SearchSkeleton />
        ) : query.trim() ? (
          <section>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278]">
                {results.length > 0 ? `"${query}"` : 'Sin resultados'}
              </h2>
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/50">{results.length} encontrados</span>
            </div>

            {results.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="w-10 h-10 text-[#F0EAE0]/8 mx-auto mb-4" strokeWidth={1} />
                <p className="text-[#8A8278] text-[15px] font-medium mb-1">Sin resultados para "{query}"</p>
                <p className="text-[#8A8278]/40 text-[13px] mb-5">Probá con otro término o revisá la categoría</p>
                <button
                  onClick={() => setQuery('')}
                  className="text-[11px] uppercase tracking-[0.15em] text-[#C9A55A]/70 hover:text-[#C9A55A] transition-colors"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {results.map(p => <SearchProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            {recent.length > 0 && (
              <section className="mb-7">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278]">Búsquedas recientes</h2>
                  <button
                    onClick={clearRecent}
                    className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/40 hover:text-[#8A8278] transition-colors"
                  >
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map(t => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#221E1A] border border-[#2E2925] text-[13px] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all duration-300"
                    >
                      <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278] mb-4">Catálogo</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
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
    <Link href={`/product/${product.id}`} className="group flex flex-col transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#221E1A] mb-2.5 border border-[#2E2925]/40 group-hover:border-[#C9A55A]/30 transition-all duration-500">
        {img ? (
          <ImageFade src={img} alt={product.name} containerClassName="w-full h-full" className="product-img-hover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-[#8A8278]/15" strokeWidth={1} />
          </div>
        )}
      </div>
      <h3 className="text-[13px] font-medium text-[#F0EAE0]/90 line-clamp-2 leading-snug mb-1">{product.name}</h3>
      <span className="text-[13px] font-serif italic text-[#C9A55A]">{formatARS(product.price)}</span>
    </Link>
  )
}
