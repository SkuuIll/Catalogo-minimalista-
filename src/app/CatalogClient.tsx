'use client'

import { useState, useMemo } from 'react'
import { ScrollReveal } from '@/components/ScrollReveal'

export function CatalogClient({
  products,
  categories,
}: {
  products: any[]
  categories: any[]
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

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
      {/* Barra de búsqueda */}
      <div className="mb-6 sm:mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Filtros de categoría - scroll horizontal en mobile */}
      {categories.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all
                ${activeCategory === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface hover:border-white/10'
                }
              `}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all flex items-center gap-1.5
                  ${activeCategory === cat.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface hover:border-white/10'
                  }
                `}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
                <span className={`text-[10px] opacity-60 ${activeCategory === cat.id ? 'text-on-primary' : ''}`}>
                  ({cat._count?.products ?? products.filter((p: any) => p.categoryId === cat.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-8 lg:gap-x-12 gap-y-10 sm:gap-y-16">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 sm:py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center">
              <svg className="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-on-surface-variant font-serif italic text-lg sm:text-xl">
              {search ? 'No se encontraron productos con ese término.' : 'No hay productos en esta categoría.'}
            </p>
          </div>
        ) : (
          filtered.map((product, index) => (
            <ScrollReveal key={product.id} delay={Math.min(index * 0.08, 0.5)} direction="up">
              <ProductCard product={product} />
            </ScrollReveal>
          ))
        )}
      </div>
    </>
  )
}

function ProductCard({ product }: { product: any }) {
  const imageUrl = product.imagePath || product.imageUrl

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[4/5] bg-surface overflow-hidden rounded-xl mb-4 sm:mb-5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="font-serif italic text-on-surface-variant">Sin imagen</span>
          </div>
        )}

        <div className="absolute top-3 right-3 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">${product.price.toFixed(2)}</span>
        </div>

        {product.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-background/60 backdrop-blur-sm rounded-full">
            <span className="text-[10px] font-medium text-on-surface-variant">
              {product.category.icon} {product.category.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-3">
          <h3 className="font-serif text-lg sm:text-xl lg:text-[22px] font-medium text-on-surface group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
          <span className="text-sm font-medium text-primary whitespace-nowrap mt-1">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-on-surface-variant font-light mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  )
}
