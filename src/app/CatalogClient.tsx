'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Package, X, SlidersHorizontal, ChevronRight, TrendingUp, Sparkles } from 'lucide-react'
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
  const pillsRef = useRef<HTMLDivElement>(null)

  const activeCat = categories.find(c => c.id === activeCategory)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (activeSubcategory) return p.categoryId === activeSubcategory
      if (activeCategory) {
        const childIds = activeCat?.children?.map((c: any) => c.id) || []
        return p.categoryId === activeCategory || childIds.includes(p.categoryId)
      }
      return true
    })
  }, [products, activeCategory, activeSubcategory, activeCat])

  const subcategories = activeCat?.children || []

  // Featured = first product, grid = rest
  const featuredProduct = filtered[0]
  const gridProducts = filtered.slice(1)

  return (
    <div className="w-full">
      {/* ── Products section ─────────────────────────── */}
      <section className="px-4 md:px-8 pt-8 pb-16 md:pb-20 container-desktop mx-auto">

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="py-28 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[--bg-elevated] border border-[--border] flex items-center justify-center">
              <Package className="w-7 h-7 text-[--text-tertiary]" strokeWidth={1.25} />
            </div>
            <p className="font-display font-bold text-[18px] text-[--text-secondary]">Sin resultados</p>
            <p className="text-[12px] text-[--text-tertiary] mt-1.5 max-w-[220px] mx-auto">
              Esta categoría no tiene productos disponibles aún.
            </p>
            <button
              onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }}
              className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[--border] text-[12px] font-semibold text-[--text-secondary] hover:text-[--accent] hover:border-[--accent]/30 transition-all duration-200 press"
            >
              <X className="w-3.5 h-3.5" />
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-5 md:space-y-8">

            {/* Product grid: 2 col mobile, 3 desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Featured card */}
              {featuredProduct && (
                <ScrollReveal delay={0} className="col-span-2">
                  <FeaturedCard product={featuredProduct} />
                </ScrollReveal>
              )}

              {/* Regular products */}
              {gridProducts.map((product, i) => (
                <ScrollReveal key={product.id} delay={Math.min((i + 1) * 0.05, 0.3)}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/* ── Category pill ───────────────────────────────────── */
function CategoryPill({
  label,
  active,
  count,
  onClick,
}: {
  label: string
  active: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 h-9 px-4 rounded-full text-[12px] font-semibold tracking-[0.02em] transition-all duration-250 press ${
        active
          ? 'bg-gradient-to-r from-[--accent] to-[oklch(63%_0.18_42)] text-white shadow-md shadow-[--accent-glow]'
          : 'text-[--text-secondary] hover:text-[--text] bg-[--bg-elevated] border border-[--border] hover:border-[--border-mid]'
      }`}
    >
      {label}
      {count !== undefined && active && (
        <span className="ml-1.5 opacity-70 font-normal tabular-nums text-[10px]">{count}</span>
      )}
    </button>
  )
}

/* ── Product card ────────────────────────────────────── */
function ProductCard({ product }: { product: any }) {
  const img = getFirstImage(product)
  const hasDiscount = product.discountPrice && product.discountPrice > product.price
  const isOOS = product.status === 'OUT_OF_STOCK'
  const isPreorder = product.status === 'PREORDER'

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col focus-visible:outline-[--accent] bg-[#1a1a1a] rounded-2xl p-2 md:p-3 hover:bg-[#222] transition-colors duration-200 border border-transparent hover:border-[#333]"
    >
      {/* Image */}
      <div className={`relative aspect-square overflow-hidden bg-[#e5e5e5] rounded-xl ${isOOS ? 'opacity-80' : ''}`}>
        {img ? (
          <ImageFade
            src={img}
            alt={product.name}
            containerClassName="w-full h-full"
            className="img-zoom"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[--bg-elevated] to-[--bg-surface]">
            <Package className="w-7 h-7 text-[--text-tertiary]" strokeWidth={1} />
          </div>
        )}

        {/* OOS overlay */}
        {isOOS && (
          <div className="absolute inset-0 bg-[--bg]/65 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[--text-tertiary] bg-[--bg-surface]/80 px-2.5 py-1 rounded-full">
              Agotado
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && !isOOS && (
            <span className="bg-gradient-to-r from-[--red] to-[oklch(53%_0.20_25)] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wide shadow-sm">
              -{discountPercent(product.price, product.discountPrice)}%
            </span>
          )}
          {isPreorder && (
            <span className="bg-[--bg-elevated]/95 text-[--accent] text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wide ring-1 ring-[--accent]/25 shadow-sm">
              Encargo
            </span>
          )}
        </div>

        {/* Quick-view arrow on hover */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-7 h-7 rounded-full bg-[--bg-surface]/90 backdrop-blur-sm border border-[--border] flex items-center justify-center shadow-md">
            <ChevronRight className="w-3.5 h-3.5 text-[--text-secondary]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 px-1 pb-1 pt-3">
        {product.category && (
          <span className="text-[10px] font-medium text-[--text-tertiary] line-clamp-1">
            {product.category.name}
          </span>
        )}
        <h3 className="text-[13px] md:text-[14px] font-bold text-white leading-tight line-clamp-1 group-hover:text-[--accent] transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[14px] font-extrabold text-[#E5B567] tabular-nums">
            {formatARS(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-[--text-tertiary] line-through tabular-nums">
              {formatARS(product.discountPrice)}
            </span>
          )}
        </div>
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

/* ── Featured card — full width ─────────────────────── */
function FeaturedCard({ product }: { product: any }) {
  const img = getFirstImage(product)
  const hasDiscount = product.discountPrice && product.discountPrice > product.price
  const isOOS = product.status === 'OUT_OF_STOCK'
  const isPreorder = product.status === 'PREORDER'

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="relative w-full h-full min-h-[220px] md:min-h-[280px] overflow-hidden rounded-2xl bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 border border-transparent hover:border-[#333]">
        {/* Image */}
        {img ? (
          <ImageFade
            src={img}
            alt={product.name}
            containerClassName="w-full h-full"
            className="img-zoom"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[--bg-elevated] to-[--bg-surface]">
            <Package className="w-14 h-14 text-[--text-tertiary]" strokeWidth={0.75} />
          </div>
        )}

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex gap-2 items-center">
          <div className="flex items-center gap-1.5 bg-[--accent]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide backdrop-blur-sm shadow-lg">
            <TrendingUp className="w-3 h-3" />
            Destacado
          </div>
          {hasDiscount && !isOOS && (
            <span className="bg-gradient-to-r from-[--red] to-[oklch(53%_0.20_25)] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide shadow-lg">
              -{discountPercent(product.price, product.discountPrice)}% OFF
            </span>
          )}
          {isPreorder && (
            <span className="bg-[--bg-elevated]/90 text-[--accent] text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ring-[--accent]/25">
              Por encargo
            </span>
          )}
        </div>

        {/* Overlaid content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] md:text-[11px] font-medium text-white/70">Featured</span>
            <h3 className="font-display font-bold text-white text-[18px] md:text-[24px] leading-tight line-clamp-2 mt-1">
              {product.name}
            </h3>
            <span className="font-display font-extrabold text-[16px] md:text-[20px] text-[#E5B567] tabular-nums mt-1.5">
              {formatARS(product.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
