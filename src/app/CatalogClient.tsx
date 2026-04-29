'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package, Star, Heart } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'

export function CatalogClient({ products, categories }: { products: any[]; categories: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeCat = categories.find(c => c.id === activeCategory)
  const subcategories = activeCat?.children || []

  const filtered = useMemo(() => {
    return products.filter(p => {
      let matchCat = true
      if (activeSubcategory) matchCat = p.categoryId === activeSubcategory
      else if (activeCategory) {
        const ids = activeCat?.children?.map((c: any) => c.id) || []
        matchCat = p.categoryId === activeCategory || ids.includes(p.categoryId)
      }
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, activeCategory, activeSubcategory, search, activeCat])

  const featured = products.filter(p => p.featured).slice(0, 6)

  return (
    <>
      {/* Search */}
      <div className="sticky top-11 z-40 px-4 py-2 bg-[#060606]/95 backdrop-blur-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-10 pl-9 pr-3 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#bf9b4e]/30 transition-all"
          />
        </div>
      </div>

      {/* Featured */}
      {!search && !activeCategory && featured.length > 0 && (
        <section className="px-4 pt-4 pb-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35 mb-3">Destacados</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-2">
            {featured.map(product => {
              let imgs: string[] = []
              try { if (product.images) imgs = JSON.parse(product.images) } catch {}
              const img = imgs[0] || product.imagePath || product.imageUrl
              return (
                <Link key={product.id} href={`/product/${product.id}`} className="flex-shrink-0 w-32 group">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50">
                    {img && <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />}
                    {!img && <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-white/10" /></div>}
                    {product.status === 'OUT_OF_STOCK' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Agotado</span>
                      </div>
                    )}
                    {product.status === 'PREORDER' && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#d4a030]/20 backdrop-blur-md text-[9px] font-semibold text-[#d4a030]">
                        Pedido
                      </div>
                    )}
                  </div>
                  <h3 className="text-[11px] font-medium text-white/90 line-clamp-1">{product.name}</h3>
                  <span className="text-[11px] font-semibold text-[#bf9b4e]">${product.price.toFixed(2)}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      {!search && (
        <section className="px-4 py-4">
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">Categorías</h2>
            {activeCategory && (
              <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }} className="text-[11px] text-[#bf9b4e]/70 hover:text-[#bf9b4e] transition-colors">
                Ver todo
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(activeCategory === cat.id ? null : cat.id)
                  setActiveSubcategory(null)
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 w-14 transition-all ${activeCategory === cat.id ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.id ? 'bg-[#bf9b4e] text-black' : 'bg-[#111] text-white/40 border border-[#1a1a1a]'}`}>
                  <Package className="w-4.5 h-4.5" />
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${activeCategory === cat.id ? 'text-[#bf9b4e]' : 'text-white/50'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Subcategories */}
      {subcategories.length > 0 && !search && (
        <section className="px-4 py-1">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mr-4 pr-4">
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
      <section className="px-4 py-4">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">
            {search ? 'Resultados' : activeCategory ? activeCat?.name : 'Catálogo'}
          </h2>
          <span className="text-[10px] text-white/35">{filtered.length} productos</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#111] flex items-center justify-center border border-[#1a1a1a]">
              <Package className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-white/40 text-sm font-medium">{search ? 'Sin resultados' : 'Sin productos'}</p>
            <p className="text-white/35 text-xs mt-1">{search ? 'Intenta otro término' : 'Prueba otra categoría'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.id} delay={Math.min(i * 0.04, 0.25)}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function SubPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${active ? 'bg-[#bf9b4e] text-black' : 'bg-[#111] text-white/50 border border-[#1a1a1a] hover:text-white/80'}`}
    >
      {children}
    </button>
  )
}

function ProductCard({ product }: { product: any }) {
  let imgs: string[] = []
  try { if (product.images) imgs = JSON.parse(product.images) } catch {}
  const img = imgs[0] || product.imagePath || product.imageUrl

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col active:scale-[0.98] transition-transform duration-150">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/20 transition-all duration-500">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-white/10" /></div>
        )}

        {product.status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Agotado</span>
          </div>
        )}

        {product.status === 'PREORDER' && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#d4a030]/20 backdrop-blur-md text-[9px] font-semibold text-[#d4a030]">Pedido</div>
        )}

        {product.featured && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#bf9b4e]" />
        )}
      </div>

      <h3 className="text-[11px] font-medium text-white/90 leading-tight line-clamp-1">{product.name}</h3>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[11px] font-semibold text-[#bf9b4e]">${product.price.toFixed(2)}</span>
        {product.category && <span className="text-[9px] text-white/35">{product.category.name}</span>}
      </div>
    </Link>
  )
}
