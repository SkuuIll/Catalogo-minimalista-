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
    <div className="min-h-screen bg-[#0a0a0a] pb-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3 h-16 px-6 max-w-7xl mx-auto">
          <Link href="/" className="p-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="SEARCH"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-transparent border-b border-[#1a1a1a] h-12 pl-12 pr-10 text-[14px] uppercase tracking-[0.2em] text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#c9a55a] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1} />
              </button>
            )}
          </div>
          <MobileMenu />
        </div>
      </header>

      <div className="h-16" />

      <main className="px-6 pt-10 max-w-7xl mx-auto">
        {loading ? (
          <SearchSkeleton />
        ) : query.trim() ? (
          <section>
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-[9px] font-normal uppercase tracking-[0.3em] text-[#666]">
                {results.length > 0 ? `"${query.toUpperCase()}"` : 'NO RESULTS'}
              </h2>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#666]">{results.length} PIECES</span>
            </div>

            {results.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="w-12 h-12 text-[#222] mx-auto mb-6" strokeWidth={1} />
                <p className="text-[#666] text-[13px] uppercase tracking-[0.2em] mb-2">NO RESULTS FOR "{query.toUpperCase()}"</p>
                <p className="text-[#444] text-[11px] uppercase tracking-[0.15em] mb-6">TRY ANOTHER TERM OR BROWSE CATEGORIES</p>
                <button
                  onClick={() => setQuery('')}
                  className="text-[9px] uppercase tracking-[0.25em] text-[#c9a55a] hover:text-[#e8e8e8] transition-colors"
                >
                  CLEAR SEARCH
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
                {results.map(p => <SearchProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            {recent.length > 0 && (
              <section className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[9px] font-normal uppercase tracking-[0.3em] text-[#666]">RECENT SEARCHES</h2>
                  <button
                    onClick={clearRecent}
                    className="text-[9px] uppercase tracking-[0.25em] text-[#666] hover:text-[#e8e8e8] transition-colors"
                  >
                    CLEAR
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map(t => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#0f0f0f] border border-[#1a1a1a] text-[9px] uppercase tracking-[0.2em] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a] transition-all duration-300"
                    >
                      <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={1} />
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-[9px] font-normal uppercase tracking-[0.3em] text-[#666] mb-6">COLLECTION</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
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
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0f0f0f] mb-4 border border-[#1a1a1a] group-hover:border-[#2a2a2a] transition-all duration-500">
        {img ? (
          <ImageFade src={img} alt={product.name} containerClassName="w-full h-full" className="product-img-hover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-[#222]" strokeWidth={1} />
          </div>
        )}
      </div>
      <h3 className="font-serif text-[14px] font-light text-[#e8e8e8] leading-[1.3] mb-1 tracking-[0.05em] group-hover:text-[#c9a55a] transition-colors duration-300">{product.name}</h3>
      <span className="font-serif text-[14px] italic text-[#c9a55a]">{formatARS(product.price)}</span>
    </Link>
  )
}
