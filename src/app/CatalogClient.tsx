'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package, ChevronRight, Star, Heart } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'

export function CatalogClient({
  products,
  categories,
}: {
  products: any[]
  categories: any[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeCat = categories.find(c => c.id === activeCategory)
  const subcategories = activeCat?.children || []

  const filtered = useMemo(() => {
    return products.filter((p) => {
      let matchesCategory = true
      if (activeSubcategory) {
        matchesCategory = p.categoryId === activeSubcategory
      } else if (activeCategory) {
        const subIds = activeCat?.children?.map((c: any) => c.id) || []
        matchesCategory = p.categoryId === activeCategory || subIds.includes(p.categoryId)
      }
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, activeSubcategory, search, activeCat])

  const featured = products.filter(p => p.featured).slice(0, 5)

  return (
    <>
      {/* Search bar sticky */}
      <div className="sticky top-12 sm:top-14 z-40 px-4 sm:px-0 py-2 bg-background/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-white/[0.06] rounded-xl py-2.5 pl-9 pr-4 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Featured products horizontal scroll */}
      {!search && !activeCategory && featured.length > 0 && (
        <section className="px-4 sm:px-0 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-primary" />
              Destacados
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex-shrink-0 w-36 sm:w-44 group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-surface ring-1 ring-white/[0.04]">
                  <img
                    src={product.imagePath || product.imageUrl || ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {product.featured && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  )}
                </div>
                <h3 className="text-xs font-medium text-on-surface line-clamp-1">{product.name}</h3>
                <p className="text-xs text-primary font-semibold mt-0.5">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categorías tipo app */}
      {!search && (
        <section className="px-4 sm:px-0 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-on-surface">Categorías</h2>
            {activeCategory && (
              <button
                onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }}
                className="text-[11px] text-primary font-medium"
              >
                Ver todo
              </button>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(activeCategory === cat.id ? null : cat.id)
                  setActiveSubcategory(null)
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 w-16 sm:w-20 transition-all ${
                  activeCategory === cat.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-container text-on-surface-variant border border-white/[0.06]'
                }`}>
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                  activeCategory === cat.id ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Subcategorías */}
      {subcategories.length > 0 && !search && (
        <section className="px-4 sm:px-0 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveSubcategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                !activeSubcategory
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-white/[0.06] text-on-surface-variant'
              }`}
            >
              Todo {activeCat?.name}
            </button>
            {subcategories.map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubcategory(sub.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeSubcategory === sub.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container border border-white/[0.06] text-on-surface-variant'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Grid de Productos */}
      <section className="px-4 sm:px-0 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-on-surface">
            {search ? 'Resultados' : activeSubcategory ? 'Productos' : activeCategory ? activeCat?.name : 'Todos los productos'}
          </h2>
          <span className="text-[11px] text-on-surface-variant/50">{filtered.length} items</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-surface-container flex items-center justify-center border border-white/[0.04]">
                <Package className="w-6 h-6 text-on-surface-variant/30" />
              </div>
              <p className="text-on-surface-variant/50 text-sm font-medium">
                {search ? 'No se encontraron productos' : 'No hay productos'}
              </p>
            </div>
          ) : (
            filtered.map((product, index) => (
              <ScrollReveal key={product.id} delay={Math.min(index * 0.04, 0.3)} direction="up" duration={0.5}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))
          )}
        </div>
      </section>
    </>
  )
}

function ProductCard({ product }: { product: any }) {
  const images = product.images ? JSON.parse(product.images) : []
  const imageUrl = images[0] || product.imagePath || product.imageUrl

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded-xl sm:rounded-2xl mb-2 ring-1 ring-white/[0.04] group-active:scale-[0.98] transition-transform duration-150">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <Package className="w-6 h-6 text-on-surface-variant/20" />
          </div>
        )}

        {product.featured && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
        )}

        <button
          onClick={(e) => e.preventDefault()}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      <div className="flex flex-col px-0.5">
        <h3 className="text-xs sm:text-sm font-medium text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs sm:text-sm font-bold text-primary">${product.price.toFixed(2)}</span>
          {product.category && (
            <span className="text-[10px] text-on-surface-variant/50">{product.category.name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
