'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Package } from 'lucide-react'
import { ScrollReveal, ParallaxImage, SkeletonCard } from '@/components/ScrollReveal'

export function CatalogClient({
  products,
  categories,
}: {
  products: any[]
  categories: any[]
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, search])

  return (
    <>
      {/* Barra de búsqueda sticky */}
      <div className="sticky top-14 sm:top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-background/80 backdrop-blur-xl border-b border-white/[0.04] sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:static sm:py-0 mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <span className="text-xs text-on-surface-variant">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros de categoría */}
      {categories.length > 0 && (
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <SlidersHorizontal className="w-3.5 h-3.5 text-on-surface-variant/60" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-variant/60">Categorías</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <CategoryPill
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              label="Todos"
              count={products.length}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                label={cat.name}
                count={products.filter((p: any) => p.categoryId === cat.id).length}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 sm:py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-container flex items-center justify-center border border-white/[0.04]">
              <Package className="w-7 h-7 text-on-surface-variant/40" />
            </div>
            <p className="text-on-surface-variant/60 font-medium text-sm sm:text-base">
              {search ? 'No se encontraron productos' : 'No hay productos en esta categoría'}
            </p>
            <p className="text-on-surface-variant/40 text-xs mt-1">Intenta con otro término o categoría</p>
          </div>
        ) : (
          filtered.map((product, index) => (
            <ScrollReveal key={product.id} delay={Math.min(index * 0.06, 0.4)} direction="up" duration={0.6}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))
        )}
      </div>

      {/* Contador de resultados */}
      {filtered.length > 0 && (
        <div className="mt-8 sm:mt-12 text-center">
          <span className="text-[11px] text-on-surface-variant/40 font-medium tracking-wide">
            Mostrando {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      )}
    </>
  )
}

function CategoryPill({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300
        ${active
          ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
          : 'bg-surface-container border border-white/[0.06] text-on-surface-variant hover:text-on-surface hover:border-white/10 hover:bg-white/[0.02]'
        }
      `}
    >
      <span>{label}</span>
      <span className={`ml-1.5 text-[10px] opacity-60 ${active ? 'text-on-primary' : ''}`}>
        {count}
      </span>
    </button>
  )
}

function ProductCard({ product }: { product: any }) {
  const imageUrl = product.imagePath || product.imageUrl

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-surface overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-4 ring-1 ring-white/[0.04] group-hover:ring-primary/20 transition-all duration-500">
        {imageUrl ? (
          <ParallaxImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <Package className="w-8 h-8 text-on-surface-variant/30" />
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Precio flotante */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <span className="px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-lg text-[11px] font-bold text-primary border border-white/10">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Badge categoría */}
        {product.category && (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[9px] sm:text-[10px] font-semibold text-white/90 border border-white/10">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Badge destacado */}
        {product.featured && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
          </div>
        )}
      </div>

      <div className="flex flex-col px-0.5">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-serif text-sm sm:text-base lg:text-lg font-medium text-on-surface group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-1">
            {product.name}
          </h3>
          <span className="text-xs sm:text-sm font-semibold text-primary whitespace-nowrap mt-0.5">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-on-surface-variant/70 font-light line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  )
}
