'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import { formatARS, discountPercent } from '@/lib/format'

export function CatalogClient({
  products,
  categories,
  initialCategory = null,
}: {
  products: any[]
  categories: any[]
  initialCategory?: string | null
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeCat = categories.find(c => c.id === activeCategory)
  const subcategories = activeCat?.children || []

  const filtered = useMemo(() => {
    return products.filter(p => {
      let matchCat = true
      if (activeSubcategory) {
        matchCat = p.categoryId === activeSubcategory
      } else if (activeCategory) {
        const ids = activeCat?.children?.map((c: any) => c.id) || []
        matchCat = p.categoryId === activeCategory || ids.includes(p.categoryId)
      }
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [products, activeCategory, activeSubcategory, search, activeCat])

  const featured = products.filter(p => p.featured).slice(0, 6)

  return (
    <>
      {/* Sticky search bar */}
      <div className="sticky top-11 z-40 px-4 py-2.5 bg-[#060606]/95 backdrop-blur-2xl border-b border-[#1a1a1a]/40">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl h-10 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Featured horizontal scroll */}
        {!search && !activeCategory && featured.length > 0 && (
          <section className="px-4 pt-5 pb-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35 mb-3">Destacados</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-2">
              {featured.map(product => {
                const img = getFirstImage(product)
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex-shrink-0 w-36 sm:w-40 md:w-44 group"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2.5 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/25 transition-all duration-500">
                      {img ? (
                        <img
                          src={img} alt={product.name}
                          className="w-full h-full object-cover product-img-hover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-white/10" />
                        </div>
                      )}
                      {product.status === 'OUT_OF_STOCK' && (
                        <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Agotado</span>
                        </div>
                      )}
                      {product.status === 'PREORDER' && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#d4a030]/25 backdrop-blur-md text-[10px] font-semibold text-[#d4a030]">
                          Por pedido
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-white/90 line-clamp-1 leading-snug">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm font-semibold text-[#bf9b4e]">{formatARS(product.price)}</span>
                      {product.discountPrice && (
                        <span className="text-xs text-white/25 line-through">{formatARS(product.discountPrice)}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Categories */}
        {!search && (
          <section className="px-4 py-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Categorías</h2>
              {activeCategory && (
                <button
                  onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }}
                  className="text-xs text-[#bf9b4e]/70 hover:text-[#bf9b4e] transition-colors"
                >
                  Ver todo
                </button>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-1 lg:overflow-visible lg:flex-wrap">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(isActive ? null : cat.id)
                      setActiveSubcategory(null)
                    }}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all ${isActive ? 'opacity-100' : 'opacity-45 hover:opacity-75'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-[#bf9b4e] text-black' : 'bg-[#0d0d0d] border border-[#1a1a1a] text-white/40'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight max-w-[52px] ${isActive ? 'text-[#bf9b4e]' : 'text-white/50'}`}>
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && !search && (
          <section className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mr-4 pr-4">
              <SubPill active={!activeSubcategory} onClick={() => setActiveSubcategory(null)}>
                Todo {activeCat?.name}
              </SubPill>
              {subcategories.map((s: any) => (
                <SubPill key={s.id} active={activeSubcategory === s.id} onClick={() => setActiveSubcategory(s.id)}>
                  {s.name}
                </SubPill>
              ))}
            </div>
          </section>
        )}

        {/* Products grid */}
        <section className="px-4 pb-6 pt-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              {search
                ? `Resultados para "${search}"`
                : activeCategory ? activeCat?.name : 'Catálogo'}
            </h2>
            <span className="text-xs text-white/30">{filtered.length} productos</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#0d0d0d] flex items-center justify-center border border-[#1a1a1a]">
                <Package className="w-5 h-5 text-white/10" />
              </div>
              <p className="text-white/45 text-sm font-medium">
                {search ? 'Sin resultados' : 'Sin productos'}
              </p>
              <p className="text-white/30 text-xs mt-1.5">
                {search ? 'Intentá con otro término' : 'Probá otra categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
              {filtered.map((product, i) => (
                <ScrollReveal key={product.id} delay={Math.min(i * 0.04, 0.2)}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function SubPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? 'bg-[#bf9b4e] text-black'
          : 'bg-[#0d0d0d] border border-[#1a1a1a] text-white/45 hover:text-white/75'
      }`}
    >
      {children}
    </button>
  )
}

function getFirstImage(product: any): string | null {
  try {
    if (product.images) {
      const imgs = JSON.parse(product.images)
      if (Array.isArray(imgs) && imgs[0]) return imgs[0]
    }
  } catch {}
  return product.imagePath || product.imageUrl || null
}

function ProductCard({ product }: { product: any }) {
  const img = getFirstImage(product)
  const hasDiscount = product.discountPrice && product.discountPrice > product.price

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col active:scale-[0.97] transition-transform duration-150"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2.5 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/20 transition-all duration-500">
        {img ? (
          <img
            src={img} alt={product.name}
            className="w-full h-full object-cover product-img-hover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-white/8" />
          </div>
        )}

        {product.status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Agotado</span>
          </div>
        )}

        {product.status === 'PREORDER' && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#d4a030]/20 backdrop-blur-md text-[10px] font-semibold text-[#d4a030]">
            Pedido
          </div>
        )}

        {hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#e05555]/20 backdrop-blur-md text-[10px] font-bold text-[#e05555]">
            -{discountPercent(product.price, product.discountPrice)}%
          </div>
        )}

        {product.featured && !hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#bf9b4e]" />
        )}
      </div>

      {/* Text below image */}
      <h3 className="text-sm font-medium text-white/90 leading-tight line-clamp-2 mb-1">{product.name}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-[#bf9b4e]">{formatARS(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-white/25 line-through">{formatARS(product.discountPrice)}</span>
          )}
        </div>
        {product.category && (
          <span className="text-[11px] text-white/30 hidden sm:inline">{product.category.name}</span>
        )}
      </div>
    </Link>
  )
}
