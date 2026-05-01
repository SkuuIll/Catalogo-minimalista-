'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package } from 'lucide-react'
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

  return (
    <>
      {/* Sticky search bar - Minimal */}
      <div className="sticky top-16 z-40 px-6 py-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
          <input
            type="text"
            placeholder="Search collection…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-[#1a1a1a] h-10 pl-8 pr-10 text-[13px] text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#c9a55a]/30 transition-colors tracking-[0.1em]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#444] hover:text-[#e8e8e8] transition-colors duration-300"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Categories - Minimal pills */}
        {!search && (
          <section className="px-6 py-8">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-6 pr-6 pb-2">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(isActive ? null : cat.id)
                      setActiveSubcategory(null)
                    }}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-none text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#c9a55a] text-[#0a0a0a]' 
                        : 'bg-[#0f0f0f] border border-[#1a1a1a] text-[#666] hover:border-[#2a2a2a] hover:text-[#888]'
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Products grid - Luxury minimal */}
        <section className="px-6 pb-12 pt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[9px] font-normal uppercase tracking-[0.3em] text-[#666]">
              {search ? `"${search.toUpperCase()}"` : activeCategory ? activeCat?.name : 'COLLECTION'}
            </h2>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#444]">{filtered.length} PIECES</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="w-10 h-10 text-[#222] mx-auto mb-4" strokeWidth={1} />
              <p className="font-serif text-lg font-light text-[#666] tracking-[0.1em] mb-2">
                {search ? 'NO RESULTS' : 'UNAVAILABLE'}
              </p>
              <p className="text-[12px] text-[#444] tracking-[0.05em]">
                {search ? 'Try a different search term' : 'This collection is currently empty'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
              {filtered.map((product, i) => (
                <ScrollReveal key={product.id} delay={Math.min(i * 0.05, 0.25)}>
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

function ProductCard({ product }: { product: any }) {
  const img = getFirstImage(product)
  const hasDiscount = product.discountPrice && product.discountPrice > product.price

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col">
      {/* Image container - Minimal border */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0f0f0f] mb-4 border border-[#1a1a1a] group-hover:border-[#2a2a2a] transition-colors duration-500">
        {img ? (
          <ImageFade src={img} alt={product.name} containerClassName="w-full h-full" className="product-img-hover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-[#222]" strokeWidth={1} />
          </div>
        )}

        {/* Status badges - Minimal */}
        {product.status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-[#0a0a0a]/80 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-[8px] font-normal text-[#666] uppercase tracking-[0.2em]">Unavailable</span>
          </div>
        )}

        {product.status === 'PREORDER' && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-[#0f0f0f]/90 border border-[#1a1a1a] text-[8px] font-normal uppercase tracking-[0.2em] text-[#c9a55a]">
            By Order
          </div>
        )}

        {hasDiscount && product.status !== 'OUT_OF_STOCK' && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[#0f0f0f]/90 border border-[#1a1a1a] text-[8px] font-bold uppercase tracking-[0.2em] text-[#c44]">
            -{discountPercent(product.price, product.discountPrice)}%
          </div>
        )}
      </div>

      {/* Product info - Minimal typography */}
      <div className="space-y-2">
        <h3 className="font-serif text-[14px] font-light text-[#e8e8e8] leading-[1.3] tracking-[0.05em] group-hover:text-[#c9a55a] transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-serif text-[14px] italic text-[#c9a55a]">{formatARS(product.price)}</span>
          {hasDiscount && (
            <span className="text-[12px] text-[#444] line-through">{formatARS(product.discountPrice)}</span>
          )}
        </div>
        {product.category && (
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#444]">
            {product.category.name}
          </span>
        )}
      </div>
    </Link>
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
