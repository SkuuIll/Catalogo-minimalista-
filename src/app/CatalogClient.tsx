'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package, X } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ImageFade } from '@/components/ImageFade'
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
      <div className="sticky top-11 z-40 px-4 py-3 bg-[#1A1714]/97 backdrop-blur-xl border-b border-[#2E2925]/50">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-[#3D3830] h-12 pl-11 pr-10 text-[15px] text-[#F0EAE0] placeholder-[#8A8278]/40 focus:outline-none focus:border-[#C9A55A] transition-colors duration-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Featured horizontal scroll */}
        {!search && !activeCategory && featured.length > 0 && (
          <section className="px-4 pt-8 pb-4">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278]">Destacados</h2>
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/40">{featured.length} artículos</span>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-3">
              {featured.map(product => {
                const img = getFirstImage(product)
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex-shrink-0 w-40 sm:w-44 md:w-48 group"
                  >
                    <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#221E1A] mb-3 border border-[#2E2925]/40 group-hover:border-[#C9A55A]/40 transition-all duration-500">
                      {img ? (
                        <ImageFade src={img} alt={product.name} containerClassName="w-full h-full" className="product-img-hover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-7 h-7 text-[#8A8278]/15" />
                        </div>
                      )}
                      {product.status === 'OUT_OF_STOCK' && (
                        <div className="absolute inset-0 bg-[#1A1714]/80 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="text-[10px] font-normal text-[#8A8278] uppercase tracking-[0.2em]">Agotado</span>
                        </div>
                      )}
                      {product.status === 'PREORDER' && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm bg-[#C9A55A]/10 border border-[#C9A55A]/20 text-[10px] font-normal uppercase tracking-[0.15em] text-[#C9A55A]">
                          Por pedido
                        </div>
                      )}
                    </div>
                    <h3 className="text-[15px] font-medium text-[#F0EAE0]/90 line-clamp-2 leading-snug mb-1.5 tracking-tight">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-serif italic text-[#C9A55A]">{formatARS(product.price)}</span>
                      {product.discountPrice && (
                        <span className="text-[13px] text-[#8A8278]/40 line-through">{formatARS(product.discountPrice)}</span>
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
          <section className="px-4 py-6">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278]">Categorías</h2>
              {activeCategory && (
                <button
                  onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }}
                  className="text-[11px] uppercase tracking-[0.15em] text-[#C9A55A]/70 hover:text-[#C9A55A] transition-colors duration-300"
                >
                  Ver todo
                </button>
              )}
            </div>
            <div className="flex gap-5 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-1 lg:overflow-visible lg:flex-wrap lg:justify-start">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(isActive ? null : cat.id)
                      setActiveSubcategory(null)
                    }}
                    className="flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 rounded-sm flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#C9A55A] text-[#1A1714]' : 'bg-[#221E1A] border border-[#2E2925] text-[#8A8278] group-hover:border-[#3D3830] group-hover:text-[#F0EAE0]'}`}>
                      <Package className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.15em] text-center leading-tight transition-colors duration-300 ${isActive ? 'text-[#C9A55A]' : 'text-[#8A8278] group-hover:text-[#F0EAE0]'}`}>
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
          <section className="px-4 pb-4">
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
        <section className="px-4 pb-12 pt-4">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278]">
              {search ? `Resultados para "${search}"` : activeCategory ? activeCat?.name : 'Catálogo'}
            </h2>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/40">{filtered.length} productos</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 lg:gap-6">
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
      className={`flex-shrink-0 px-4 py-1.5 rounded-sm text-[11px] font-normal uppercase tracking-[0.15em] transition-all duration-300 ${
        active
          ? 'bg-[#C9A55A] text-[#1A1714]'
          : 'bg-[#221E1A] border border-[#2E2925] text-[#8A8278] hover:border-[#3D3830] hover:text-[#F0EAE0]'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="py-28 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#221E1A] border border-[#2E2925] flex items-center justify-center">
        <Package className="w-8 h-8 text-[#8A8278]/20" strokeWidth={1} />
      </div>
      <p className="font-serif text-lg font-light text-[#F0EAE0]/80 tracking-[0.02em] mb-2">
        {search ? 'Sin resultados' : 'Sin productos'}
      </p>
      <p className="text-[13px] text-[#8A8278]/50 leading-relaxed max-w-xs mx-auto">
        {search
          ? 'No encontramos productos que coincidan con tu búsqueda. Probá con otros términos.'
          : 'Esta categoría no tiene productos disponibles en este momento.'}
      </p>
    </div>
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
      className="group flex flex-col"
    >
      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#221E1A] mb-3.5 border border-[#2E2925]/30 transition-all duration-500 group-hover:border-[#C9A55A]/30">
        {img ? (
          <ImageFade src={img} alt={product.name} containerClassName="w-full h-full" className="product-img-hover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-7 h-7 text-[#8A8278]/15" strokeWidth={1} />
          </div>
        )}

        {product.status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-[#1A1714]/80 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-[10px] font-normal text-[#8A8278] uppercase tracking-[0.2em]">Agotado</span>
          </div>
        )}

        {product.status === 'PREORDER' && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm bg-[#C9A55A]/10 border border-[#C9A55A]/20 text-[10px] font-normal uppercase tracking-[0.15em] text-[#C9A55A]">
            Pedido
          </div>
        )}

        {hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-sm bg-[#C0392B]/10 border border-[#C0392B]/20 text-[10px] font-normal uppercase tracking-[0.15em] text-[#C0392B]">
            -{discountPercent(product.price, product.discountPrice)}%
          </div>
        )}

        {product.featured && !hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#C9A55A]" />
        )}
      </div>

      <h3 className="text-[15px] font-medium text-[#F0EAE0]/90 line-clamp-2 leading-snug mb-1.5 tracking-tight group-hover:text-[#F0EAE0] transition-colors duration-300">
        {product.name}
      </h3>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-serif italic text-[#C9A55A]">{formatARS(product.price)}</span>
          {hasDiscount && (
            <span className="text-[13px] text-[#8A8278]/40 line-through">{formatARS(product.discountPrice)}</span>
          )}
        </div>
        {product.category && (
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#8A8278]/60 hidden sm:inline-block">
            {product.category.name}
          </span>
        )}
      </div>
    </Link>
  )
}
