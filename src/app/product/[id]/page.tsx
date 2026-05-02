import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatARS, discountPercent } from '@/lib/format'
import { ImageCarousel } from '@/components/ImageCarousel'
import { ImageFade } from '@/components/ImageFade'
import { Reviews } from '@/components/Reviews'
import {
  ArrowLeft, Share2, Heart, Star, Package,
  ChevronRight, MessageCircle, X, Truck, Shield, RefreshCw, Zap, Tag
} from 'lucide-react'

const siteUrl = process.env.SITE_URL || 'https://showjr.store'

function getProductImages(product: any): string[] {
  let images: string[] = []
  try { if (product.images) images = JSON.parse(product.images) } catch {}
  if (images.length === 0) {
    const legacy = product.imagePath || product.imageUrl
    if (legacy) images = [legacy]
  }
  return images.filter(Boolean)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) {
    return { title: 'Producto no encontrado', description: 'Este producto no existe o fue eliminado.' }
  }

  const images = getProductImages(product)
  const title = `${product.name} — ${formatARS(product.price)}`
  const description =
    product.description.length > 160
      ? product.description.substring(0, 157) + '…'
      : product.description
  const imageUrl = images[0] || `${siteUrl}/og-image.png`
  const productUrl = `${siteUrl}/product/${product.id}`

  return {
    title,
    description,
    openGraph: {
      title, description, url: productUrl, type: 'article',
      images: [{ url: imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`, width: 1200, height: 630, alt: product.name }],
      siteName: 'Aura — Catálogo Premium',
      locale: 'es_AR',
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: [imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: { include: { parent: true } }, specifications: true },
    }),
    prisma.siteSettings.findFirst(),
  ])

  if (!product) notFound()

  const images = getProductImages(product)

  let reviewData: { average: number; total: number; distribution: Record<number, number>; reviews: any[] } = {
    average: 0, total: 0, distribution: {}, reviews: []
  }
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id, approved: true },
      orderBy: { createdAt: 'desc' },
    })
    const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
    reviewData = {
      average: Math.round(avg * 10) / 10,
      total: reviews.length,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
      reviews,
    }
  } catch (error) {
    console.error('Error loading reviews:', error)
  }

  const breadcrumb: { label: string; href?: string }[] = []
  if (product.category?.parent) {
    breadcrumb.push({ label: product.category.parent.name })
  }
  if (product.category) {
    breadcrumb.push({ label: product.category.name })
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 6,
    include: { category: true },
  })

  const waNumber = settings?.whatsappNumber?.replace(/\D/g, '')
  const waMessage = encodeURIComponent(
    `${settings?.whatsappMessage || 'Hola, quiero información sobre:'} ${product.name} (${formatARS(product.price)})`
  )
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null

  const isPreorder  = product.status === 'PREORDER'
  const isOutOfStock = product.status === 'OUT_OF_STOCK'
  const hasDiscount = product.discountPrice && product.discountPrice > product.price

  const statusConfig = {
    AVAILABLE:    { label: 'Disponible',  cls: 'status-available', dot: 'bg-[--green]' },
    PREORDER:     { label: 'Por encargo', cls: 'status-preorder',  dot: 'bg-[--amber]' },
    OUT_OF_STOCK: { label: 'Sin stock',   cls: 'status-oos',       dot: 'bg-[--red]'   },
  }
  const status = statusConfig[product.status as keyof typeof statusConfig] || statusConfig.AVAILABLE

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": images[0] || `${siteUrl}/og-image.png`,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ARS",
      "availability": product.status === 'AVAILABLE'
        ? "https://schema.org/InStock"
        : product.status === 'PREORDER'
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock",
      "url": `${siteUrl}/product/${product.id}`,
    },
    "brand": { "@type": "Brand", "name": settings?.siteName || 'Aura' },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviewData.average || 0,
      "reviewCount": reviewData.total || 0,
    },
  }

  return (
    <div className="flex flex-col min-h-full pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header ──────────────────────────────── */}
      <header className="sticky top-0 z-50 nav-glass border-b border-[--border]">
        <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-8 container-desktop mx-auto">

          {/* Back */}
          <Link
            href="/"
            aria-label="Volver"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-transparent hover:border-[--border] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-[--text-secondary]">
            <Link href="/" className="hover:text-[--accent] transition-colors">Inicio</Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 opacity-40" strokeWidth={1.5} />
                <span className={i === breadcrumb.length - 1 ? 'text-[--text] font-semibold' : ''}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>

          {/* Mobile: product name center */}
          <div className="absolute left-1/2 -translate-x-1/2 max-w-[180px] md:hidden">
            <p className="text-[11px] font-semibold text-[--text] truncate text-center">{product.name}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              aria-label="Compartir"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-transparent hover:border-[--border] transition-all duration-200"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              aria-label="Guardar"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--red] hover:bg-[--red]/5 border border-transparent hover:border-[--red]/20 transition-all duration-200"
            >
              <Heart className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: image + info ─────────────────── */}
      <div className="container-desktop mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:px-8 lg:pt-8">

          {/* ── Left: Image carousel ───────────── */}
          <div className="lg:w-[55%] lg:sticky lg:top-16 lg:self-start">
            <ImageCarousel images={images} alt={product.name} />
          </div>

          {/* ── Right: Info panel ─────────────── */}
          <main className="px-4 md:px-6 lg:px-0 pt-6 pb-6 lg:pt-2 flex-1 lg:w-[45%]">

            {/* Status + category breadcrumb */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.08em] ${status.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {product.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[--bg-elevated] text-[--text-tertiary] border border-[--border]">
                  <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                  {product.category.name}
                </span>
              )}
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-[--accent] bg-[--accent-soft] border border-[--accent]/20">
                  <Star className="w-2.5 h-2.5 fill-[--accent]" strokeWidth={0} />
                  Destacado
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-display font-extrabold text-[clamp(22px,3.5vw,34px)] text-[--text] leading-[1.12] tracking-[-0.025em] mb-4">
              {product.name}
            </h1>

            {/* Price block */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[--border]">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-extrabold text-[clamp(26px,4vw,38px)] gradient-text tabular-nums leading-none">
                  {formatARS(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-[14px] text-[--text-tertiary] line-through tabular-nums">
                    {formatARS(product.discountPrice!)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="inline-flex items-center h-7 px-2.5 rounded-lg bg-gradient-to-r from-[--red] to-[oklch(53%_0.20_25)] text-white text-[11px] font-extrabold tracking-wide shadow-sm">
                  -{discountPercent(product.price, product.discountPrice!)}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[14px] text-[--text-secondary] leading-[1.85] mb-8">
              {product.description}
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2.5 mb-8">
              {[
                { icon: Truck,     label: 'Envío disponible',   sub: 'Consultar costo' },
                { icon: Shield,    label: 'Garantía oficial',   sub: '100% original' },
                { icon: RefreshCw, label: 'Devolución',         sub: '30 días' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[--bg-surface] border border-[--border] text-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-[--accent-soft] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-[--accent]" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold text-[--text] leading-tight">{label}</span>
                  <span className="text-[9px] text-[--text-tertiary]">{sub}</span>
                </div>
              ))}
            </div>

            {/* Desktop CTA */}
            {!isOutOfStock && waLink && (
              <div className="hidden sm:flex flex-col gap-3 mb-10">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 h-13 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] text-white text-[14px] font-bold tracking-tight hover:opacity-92 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#25D366]/25 press"
                  style={{ height: '52px' }}
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={2} />
                  {isPreorder ? 'Consultar disponibilidad' : 'Comprar por WhatsApp'}
                </a>
                <p className="text-center text-[10px] text-[--text-tertiary]">
                  Respuesta inmediata · Pago seguro · Envío a todo el país
                </p>
              </div>
            )}

            {isOutOfStock && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl bg-[--bg-elevated] border border-[--border] mb-10">
                <X className="w-4 h-4 text-[--red] shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[12px] font-bold text-[--text]">Sin stock disponible</p>
                  <p className="text-[11px] text-[--text-tertiary]">Contactanos para consultar disponibilidad futura.</p>
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-[14px] text-[--text] mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[--accent] to-[oklch(63%_0.18_42)]" />
                  Especificaciones
                </h2>
                <div className="rounded-2xl overflow-hidden border border-[--border] divide-y divide-[--border]">
                  {product.specifications.map((spec) => (
                    <div key={spec.id} className="flex items-start justify-between gap-4 px-4 py-3 bg-[--bg-surface] hover:bg-[--bg-elevated] transition-colors duration-150">
                      <span className="text-[11px] font-bold text-[--text-tertiary] uppercase tracking-[0.08em] shrink-0 mt-0.5">
                        {spec.key}
                      </span>
                      <span className="text-[13px] text-[--text] font-semibold text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related products */}
            {related.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-[14px] text-[--text] mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[--accent] to-[oklch(63%_0.18_42)]" />
                  También te puede interesar
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {related.map(p => {
                    let rImgs: string[] = []
                    try { if (p.images) rImgs = JSON.parse(p.images) } catch {}
                    const rImg = rImgs[0] || p.imagePath || p.imageUrl
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        className="group press"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[--bg-elevated] border border-[--border] mb-2 card-hover">
                          {rImg ? (
                            <ImageFade src={rImg} alt={p.name} containerClassName="w-full h-full" className="img-zoom" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-[--text-tertiary]" strokeWidth={1} />
                            </div>
                          )}
                        </div>
                        <h3 className="text-[11px] font-semibold text-[--text] line-clamp-2 leading-snug mb-0.5 group-hover:text-[--accent] transition-colors duration-200">
                          {p.name}
                        </h3>
                        <span className="text-[12px] font-extrabold gradient-text tabular-nums">
                          {formatARS(p.price)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <Reviews
              productId={product.id}
              averageRating={reviewData.average}
              totalReviews={reviewData.total}
              distribution={reviewData.distribution || {}}
            />
          </main>
        </div>
      </div>

      {/* ── Mobile sticky CTA ─────────────────── */}
      <div
        className="sticky bottom-0 z-[80] nav-glass border-t border-[--border] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[--text-tertiary] mb-0.5">Precio</p>
            <div className="flex items-baseline gap-1.5">
              <p className="font-display font-extrabold text-[18px] gradient-text leading-none tabular-nums">
                {formatARS(product.price)}
              </p>
              {hasDiscount && (
                <p className="text-[10px] text-[--text-tertiary] line-through tabular-nums">
                  {formatARS(product.discountPrice!)}
                </p>
              )}
            </div>
          </div>

          {/* CTA button */}
          {isOutOfStock ? (
            <button
              disabled
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-[--bg-elevated] text-[--text-tertiary] text-[11px] font-bold cursor-not-allowed border border-[--border]"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
              Sin stock
            </button>
          ) : waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] text-white text-[12px] font-bold shadow-lg shadow-[#25D366]/20 active:scale-[0.97] transition-all duration-200 press"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
              {isPreorder ? 'Consultar' : 'Comprar'}
            </a>
          ) : (
            <div className="flex items-center justify-center h-11 px-5 rounded-2xl bg-[--bg-elevated] text-[--text-tertiary] text-[11px]">
              No disponible
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop sticky CTA ────────────────── */}
      {!isOutOfStock && waLink && (
        <div className="hidden md:block sticky bottom-0 z-[80] nav-glass border-t border-[--border]">
          <div className="container-desktop mx-auto flex items-center justify-between px-8 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[--text-tertiary]">Precio final</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-display font-extrabold text-[22px] gradient-text tabular-nums leading-none">
                    {formatARS(product.price)}
                  </p>
                  {hasDiscount && (
                    <span className="text-[12px] text-[--text-tertiary] line-through tabular-nums">
                      {formatARS(product.discountPrice!)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 h-11 px-7 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] text-white text-[13px] font-bold hover:opacity-92 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#25D366]/25 press"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
              {isPreorder ? 'Consultar disponibilidad' : 'Comprar por WhatsApp'}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
