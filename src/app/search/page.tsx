'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
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
    if (saved) setRecent(JSON.parse(saved).slice(0, 8))
  }, [])

  useEffect(() => {
    if (query.trim() && !recent.includes(query.trim())) {
      localStorage.setItem('recentSearches', JSON.stringify([query.trim(), ...recent].slice(0, 8)))
    }
  }, [query])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    )
  }, [query, products])

  return (
    <div className="min-h-screen bg-[#060606] pb-14">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2.5 h-11 px-4">
          <Link href="/" className="p-1 -ml-1 text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-10 pl-9 pr-8 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-white/20 hover:text-white/50 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <MobileMenu />
        </div>
      </header>

      <div className="h-11" />

      <main className="px-4 pt-4">
        {loading ? (
          <div className="py-12 text-center text-white/20 text-sm">Cargando</div>
        ) : query.trim() ? (
          <section>
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Resultados</h2>
              <span className="text-[10px] text-white/20">{results.length} encontrados</span>
            </div>
            {results.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm font-medium">Sin resultados</p>
                <p className="text-white/15 text-xs mt-1">Intenta otro término</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map(p => {
                  let imgs: string[] = []
                  try { if (p.images) imgs = JSON.parse(p.images) } catch {}
                  const img = imgs[0] || p.imagePath || p.imageUrl
                  return (
                    <Link key={p.id} href={`/product/${p.id}`} className="group flex flex-col">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50">
                        {img ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" /> : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-white/10" /></div>
                        )}
                      </div>
                      <h3 className="text-[11px] font-medium text-white/90 line-clamp-1">{p.name}</h3>
                      <span className="text-[11px] font-semibold text-[#bf9b4e] mt-0.5">${p.price.toFixed(2)}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        ) : (
          <>
            {recent.length > 0 && (
              <section className="mb-6">
                <div className="flex justify-between items-end mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Recientes</h2>
                  <button onClick={() => { setRecent([]); localStorage.removeItem('recentSearches') }} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recent.map(t => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#111] border border-[#1a1a1a] text-[11px] text-white/40 hover:text-white/70 hover:border-white/10 transition-all"
                    >
                      <Clock className="w-3 h-3" />
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25 mb-3">Catálogo</h2>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 12).map(p => {
                  let imgs: string[] = []
                  try { if (p.images) imgs = JSON.parse(p.images) } catch {}
                  const img = imgs[0] || p.imagePath || p.imageUrl
                  return (
                    <Link key={p.id} href={`/product/${p.id}`} className="group flex flex-col">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50">
                        {img ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" /> : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-white/10" /></div>
                        )}
                      </div>
                      <h3 className="text-[11px] font-medium text-white/90 line-clamp-1">{p.name}</h3>
                      <span className="text-[11px] font-semibold text-[#bf9b4e] mt-0.5">${p.price.toFixed(2)}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
