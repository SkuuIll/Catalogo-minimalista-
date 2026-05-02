'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { formatARS } from '@/lib/format'
import { BottomNav } from '@/components/BottomNav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ImageFade } from '@/components/ImageFade'
import { SearchSkeleton } from '@/components/Skeleton'
import { Search, ArrowLeft, Package, X, Clock, Zap, TrendingUp, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.products || [])
        setLoading(false)
      })
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try { setRecent(JSON.parse(saved).slice(0, 8)) } catch {}
    }
    // Auto-focus
    setTimeout(() => inputRef.current?.focus(), 100)
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

  const hasQuery = query.trim().length > 0

  return (
    <div className="flex flex-col min-h-full pb-16 md:pb-0">

      {/* ── Header / Search bar ─────────────────── */}
      <header className="sticky top-0 z-50 nav-glass border-b border-[--border]">
        <div className="flex items-center gap-2 h-14 md:h-16 px-3 md:px-6 container-desktop mx-auto">

          {/* Back */}
          <Link
            href="/"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-transparent hover:border-[--border] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Link>

          {/* Search input */}
          <div className="flex-1 relative flex items-center bg-[--bg-elevated] border border-[--border] rounded-2xl focus-within:border-[--accent]/40 focus-within:bg-[--bg-surface] transition-all duration-200">
            <Search className="absolute left-3.5 w-4 h-4 text-[--text-tertiary] pointer-events-none shrink-0" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Buscar productos, categorías..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-transparent h-10 pl-10 pr-10 text-[14px] font-medium text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:ring-0"
            />
            {hasQuery && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                className="absolute right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-[--bg-elevated] text-[--text-tertiary] hover:text-[--text] transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          <ThemeToggle />
        </div>

        {/* Results count bar */}
        {hasQuery && !loading && (
          <div className="px-4 md:px-6 py-1.5 border-t border-[--border] bg-[--bg-surface]/50">
            <div className="container-desktop mx-auto flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[--text-secondary]">
                {results.length > 0 ? (
                  <><span className="text-[--accent]">{results.length}</span> resultados para &ldquo;{query}&rdquo;</>
                ) : (
                  <>Sin resultados para &ldquo;{query}&rdquo;</>
                )}
              </span>
              {results.length > 0 && (
                <span className="text-[10px] text-[--text-tertiary]">{products.length} productos en total</span>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="px-4 md:px-8 pt-6 pb-10 container-desktop mx-auto">

        {loading ? (
          <SearchSkeleton />

        ) : hasQuery ? (
          /* ── Search results ─────────────────────── */
          results.length === 0 ? (
            <div className="py-28 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[--bg-elevated] border border-[--border] flex items-center justify-center">
                <Search className="w-6 h-6 text-[--text-tertiary]" strokeWidth={1.25} />
              </div>
              <p className="font-display font-bold text-[18px] text-[--text-secondary]">Sin resultados</p>
              <p className="text-[12px] text-[--text-tertiary] mt-1.5 max-w-[240px] mx-auto">
                No encontramos nada para &ldquo;{query}&rdquo;. Intentá con otro término.
              </p>
              <button
                onClick={() => setQuery('')}
                className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[--border] text-[12px] font-semibold text-[--text-secondary] hover:text-[--accent] hover:border-[--accent]/30 transition-all duration-200 press"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar búsqueda
              </button>

              {/* Suggestions */}
              {recent.length > 0 && (
                <div className="mt-10 text-left max-w-sm mx-auto">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[--text-tertiary] mb-3">Búsquedas anteriores</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.slice(0, 4).map(t => (
                      <button
                        key={t}
                        onClick={() => setQuery(t)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[--bg-elevated] border border-[--border] text-[11px] font-semibold text-[--text-secondary] hover:text-[--text] transition-all press"
                      >
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {results.map((p, i) => (
                <ScrollReveal key={p.id} delay={Math.min(i * 0.04, 0.2)}>
                  <SearchProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          )

        ) : (
          /* ── Default state ───────────────────────── */
          <>
            {/* Recent searches */}
            {recent.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[--text-tertiary]" strokeWidth={2} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[--text-secondary]">
                      Recientes
                    </span>
                  </div>
                  <button
                    onClick={clearRecent}
                    className="text-[11px] font-semibold text-[--text-tertiary] hover:text-[--red] transition-colors"
                  >
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map(t => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[--bg-surface] border border-[--border] text-[12px] font-semibold text-[--text-secondary] hover:text-[--text] hover:border-[--accent]/30 transition-all duration-200 press"
                    >
                      <Clock className="w-3 h-3 text-[--text-tertiary]" strokeWidth={1.5} />
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Trending / full catalog */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-[--accent]" strokeWidth={2} />
                <h2 className="font-display font-bold text-[16px] text-[--text] tracking-tight">
                  Colección completa
                </h2>
                <span className="ml-auto text-[11px] font-bold text-[--text-tertiary] tabular-nums bg-[--bg-elevated] px-2.5 py-1 rounded-full border border-[--border]">
                  {products.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {products.slice(0, 12).map((p, i) => (
                  <ScrollReveal key={p.id} delay={Math.min(i * 0.04, 0.2)}>
                    <SearchProductCard product={p} />
                  </ScrollReveal>
                ))}
              </div>
              {products.length > 12 && (
                <div className="mt-8 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl border border-[--border] bg-[--bg-surface] text-[13px] font-semibold text-[--text-secondary] hover:text-[--accent] hover:border-[--accent]/30 transition-all duration-200 press"
                  >
                    Ver los {products.length} productos
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </Link>
                </div>
              )}
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
  const hasDiscount = product.discountPrice && product.discountPrice > product.price
  const isOOS = product.status === 'OUT_OF_STOCK'

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col gap-2 press">
      <div className={`relative aspect-[3/4] overflow-hidden bg-[--bg-elevated] rounded-2xl border border-[--border] card-hover ${isOOS ? 'opacity-70' : ''}`}>
        {img ? (
          <ImageFade src={img} alt={product.name} containerClassName="w-full h-full" className="img-zoom" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-[--text-tertiary]" strokeWidth={1} />
          </div>
        )}
        {isOOS && (
          <div className="absolute inset-0 bg-[--bg]/60 flex items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[--text-tertiary] bg-[--bg-surface]/80 px-2 py-0.5 rounded-full">Agotado</span>
          </div>
        )}
        {hasDiscount && !isOOS && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-[--red] to-[oklch(53%_0.20_25)] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wide shadow-sm">
            -{Math.round(((product.discountPrice! - product.price) / product.discountPrice!) * 100)}%
          </span>
        )}
        {/* Quick action */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-6 h-6 rounded-full bg-[--bg-surface]/90 border border-[--border] flex items-center justify-center shadow-md">
            <ChevronRight className="w-3 h-3 text-[--text-secondary]" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        {product.category && (
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[--text-tertiary]">
            {product.category.name}
          </span>
        )}
        <h3 className="text-[12px] md:text-[13px] font-semibold text-[--text] leading-snug line-clamp-2 group-hover:text-[--accent] transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-extrabold gradient-text tabular-nums">
            {formatARS(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-[--text-tertiary] line-through tabular-nums">
              {formatARS(product.discountPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
