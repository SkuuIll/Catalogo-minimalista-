'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package, X } from 'lucide-react'
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
      <div className="sticky top-11 z-40 px-4 py-3 bg-[#060606]/97 backdrop-blur-xl border-b border-[#1a1a1a]/50">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl h-12 pl-12 pr-10 text-base text-white placeholder-white/20 focus:outline-none focus:border-[#bf9b4e]/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Featured horizontal scroll */}
        {!search && !activeCategory && featured.length > 0 && (
          <section className="px-4 pt-6 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">Destacados</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-3">
              {featured.map(product => {
                const img = getFirstImage(product)
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex-shrink-0 w-40 sm:w-44 md:w-48 group"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-3 border border-[#1a1a1a]/60 group-hover:border-[#bf9b4e]/30 transition-all duration-500">
                      {img ? (
                        <img
                          src={img} alt={product.name}
                          className="w-full h-full object-cover product-img-hover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-white/10" />
                        </div>
                      )}
                      {product.status === 'OUT_OF_STOCK' && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Agotado</span>
                        </div>
                      )}
                      {product.status === 'PREORDER' && (
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-[#d4a030]/30 backdrop-blur-md text-xs font-semibold text-[#d4a030]">
                          Por pedido
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-medium text-white/90 line-clamp-2 leading-snug mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#bf9b4e]">{formatARS(product.price)}</span>
                      {product.discountPrice && (
                        <span className="text-sm text-white/30 line-through">{formatARS(product.discountPrice)}</span>
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
          <section className="px-4 py-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Categorías</h2>
              {activeCategory && (
                <button
                  onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }}
                  className="text-sm text-[#bf9b4e]/80 hover:text-[#bf9b4e] transition-colors font-medium"
                >
                  Ver todo
                </button>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-1 lg:overflow-visible lg:flex-wrap lg:justify-start">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(isActive ? null : cat.id)
                      setActiveSubcategory(null)
                    }}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-[#bf9b4e] text-black' : 'bg-[#0d0d0d] border border-[#2a2a2a] text-white/50'}`}>
                      <Package className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium text-center leading-tight ${isActive ? 'text-[#bf9b4e]' : 'text-white/50'}`}>
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
          <section className="px-4 pb-3">
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
        <section className="px-4 pb-8 pt-4">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white/60">
              {search
                ? `Resultados`
                : activeCategory ? activeCat?.name : 'Catálogo'}
            </h2>
            <span className="text-sm text-white/30">{filtered.length} productos</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#0d0d0d] flex items-center justify-center border border-[#1a1a1a]">
                <Package className="w-7 h-7 text-white/10" />
              </div>
              <p className="text-lg font-medium text-white/50 mb-2">
                {search ? 'Sin resultados' : 'Sin productos'}
              </p>
              <p className="text-base text-white/30">
                {search ? 'Probá con otro término' : 'Elegí otra categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
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
      className={`flex-shrink-0 px-5 py-2 rounded-full text-base font-medium transition-all ${
        active
          ? 'bg-[#bf9b4e] text-black'
          : 'bg-[#0d0d0d] border border-[#2a2a2a] text-white/50 hover:text-white/80'
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
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-3 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/25 transition-all duration-500">
        {img ? (
          <img
            src={img} alt={product.name}
            className="w-full h-full object-cover product-img-hover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-white/8" />
          </div>
        )}

        {product.status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Agotado</span>
          </div>
        )}

        {product.status === 'PREORDER' && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-[#d4a030]/25 backdrop-blur-md text-xs font-semibold text-[#d4a030]">
            Pedido
          </div>
        )}

        {hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-[#e05555]/25 backdrop-blur-md text-xs font-bold text-[#e05555]">
            -{discountPercent(product.price, product.discountPrice)}%
          </div>
        )}

        {product.featured && !hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#bf9b4e]" />
        )}
      </div>

      <h3 className="text-base font-medium text-white/90 line-clamp-2 leading-snug mb-1.5">{product.name}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#bf9b4e]">{formatARS(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-white/25 line-through">{formatARS(product.discountPrice)}</span>
          )}
        </div>
        {product.category && (
          <span className="text-sm text-white/30 hidden sm:block">{product.category.name}</span>
        )}
      </div>
    </Link>
  )
}