'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { MobileMenu } from '@/components/MobileMenu'
import { Search, ArrowLeft, Package, X } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (query.trim()) {
      const newRecent = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 8)
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-background text-on-surface sm:pb-0 pb-20">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 h-12 sm:h-14">
              <Link href="/" className="p-1 -ml-1 text-on-surface-variant hover:text-on-surface transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar productos..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-xl py-2.5 pl-9 pr-9 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-all"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-on-surface-variant/40" />
                  </button>
                )}
              </div>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="h-12 sm:h-14" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant text-sm">Cargando...</div>
        ) : query.trim() ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-on-surface">Resultados</h2>
              <span className="text-[11px] text-on-surface-variant/50">{results.length} encontrados</span>
            </div>
            {results.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-surface-container flex items-center justify-center border border-white/[0.04]">
                  <Package className="w-6 h-6 text-on-surface-variant/30" />
                </div>
                <p className="text-on-surface-variant/50 text-sm font-medium">No se encontraron productos</p>
                <p className="text-[11px] text-on-surface-variant/40 mt-1">Intenta con otro término</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.map((product) => {
                  const images = product.images ? JSON.parse(product.images) : []
                  const imageUrl = images[0] || product.imagePath || product.imageUrl
                  return (
                    <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col">
                      <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded-xl mb-2 ring-1 ring-white/[0.04] group-active:scale-[0.98] transition-transform duration-150">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container">
                            <Package className="w-6 h-6 text-on-surface-variant/20" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-medium text-on-surface line-clamp-1">{product.name}</h3>
                      <span className="text-xs font-bold text-primary mt-0.5">${product.price.toFixed(2)}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        ) : (
          <section>
            {recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-on-surface">Búsquedas recientes</h2>
                  <button
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches') }}
                    className="text-[11px] text-primary font-medium"
                  >
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-full bg-surface-container border border-white/[0.06] text-xs text-on-surface-variant hover:text-on-surface hover:border-white/10 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}

            <h2 className="text-sm font-semibold text-on-surface mb-3">Todos los productos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.slice(0, 12).map((product) => {
                const images = product.images ? JSON.parse(product.images) : []
                const imageUrl = images[0] || product.imagePath || product.imageUrl
                return (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col">
                    <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded-xl mb-2 ring-1 ring-white/[0.04] group-active:scale-[0.98] transition-transform duration-150">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container">
                          <Package className="w-6 h-6 text-on-surface-variant/20" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-medium text-on-surface line-clamp-1">{product.name}</h3>
                    <span className="text-xs font-bold text-primary mt-0.5">${product.price.toFixed(2)}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
