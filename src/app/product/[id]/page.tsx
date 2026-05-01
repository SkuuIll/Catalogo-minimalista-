import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatARS, discountPercent } from '@/lib/format'
import { ImageCarousel } from '@/components/ImageCarousel'
import { BottomNav } from '@/components/BottomNav'
import { ImageFade } from '@/components/ImageFade'
import { Reviews } from '@/components/Reviews'
import {
  ArrowLeft, Share2, Heart, Star, Package,
  ChevronRight, MessageCircle, X, Check, Truck, Shield, RefreshCw
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
  
  // Fetch reviews safely
  let reviewData: { average: number; total: number; distribution: Record<number, number>; reviews: any[] } = { average: 0, total: 0, distribution: {}, reviews: [] }
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

  const isAvailable = product.status === 'AVAILABLE'
  const isPreorder = product.status === 'PREORDER'
  const isOutOfStock = product.status === 'OUT_OF_STOCK'

  const statusStyles = {
    AVAILABLE: 'text-[#4a4] bg-[#4a4]/8 border-[#4a4]/20',
    PREORDER: 'text-[#c9a55a] bg-[#c9a55a]/8 border-[#c9a55a]/20',
    OUT_OF_STOCK: 'text-[#c44] bg-[#c44]/8 border-[#c44]/20',
  }
  const statusLabels = {
    AVAILABLE: 'Available',
    PREORDER: 'By Order',
    OUT_OF_STOCK: 'Unavailable',
  }

  const hasDiscount = product.discountPrice && product.discountPrice > product.price

  // Schema.org structured data
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
    "brand": {
      "@type": "Brand",
      "name": settings?.siteName || 'Aura',
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviewData.average || 0,
      "reviewCount": reviewData.total || 0,
    },
    "review": reviewData.reviews?.slice(0, 5).map((r: any) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
      },
      "author": {
        "@type": "Person",
        "name": r.authorName,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-28 sm:pb-0 selection:bg-[#c9a55a]/20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Floating header - Minimal luxury */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-center hover:bg-[#0f0f0f] transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 text-[#666]" strokeWidth={1} />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 max-w-[280px]">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#666] truncate block text-center">
                {product.name}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-[#0f0f0f] transition-colors duration-300">
                <Share2 className="w-4 h-4 text-[#666]" strokeWidth={1} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-[#0f0f0f] transition-colors duration-300">
                <Heart className="w-4 h-4 text-[#666]" strokeWidth={1} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-11 max-w-7xl mx-auto sm:pt-0 sm:grid sm:grid-cols-2 lg:grid-cols-[55%_1fr] sm:gap-0 sm:min-h-screen">
        {/* Image section */}
        <div className="sm:sticky sm:top-0 sm:h-screen">
          <ImageCarousel images={images} alt={product.name} />
        </div>

        {/* Info section */}
        <main className="px-6 pt-20 pb-6 sm:pt-24 sm:px-10 lg:px-16">
          {/* Breadcrumb + Status */}
          <div className="flex items-center justify-between mb-8">
            {breadcrumb.length > 0 && (
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#666]">
                {breadcrumb.map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight className="w-3 h-3 opacity-30" strokeWidth={1} />}
                    <span className={i === breadcrumb.length - 1 ? 'text-[#888]' : ''}>{item.label}</span>
                  </span>
                ))}
              </div>
            )}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-none text-[8px] font-normal uppercase tracking-[0.25em] border ${statusStyles[product.status as keyof typeof statusStyles] || statusStyles.AVAILABLE}`}>
              {statusLabels[product.status as keyof typeof statusLabels] || product.status}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#e8e8e8] leading-[1.2] tracking-[0.1em] mb-6">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-[#1a1a1a]">
            <span className="font-serif text-3xl italic text-[#c9a55a] leading-none">{formatARS(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-[14px] text-[#444] line-through">{formatARS(product.discountPrice!)}</span>
                <span className="text-[11px] font-bold text-[#c44] uppercase tracking-[0.2em]">
                  -{discountPercent(product.price, product.discountPrice!)}%
                </span>
              </>
            )}
            {product.featured && !hasDiscount && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#c9a55a]/10 border border-[#c9a55a]/20 text-[8px] uppercase tracking-[0.25em] text-[#c9a55a]">
                <Star className="w-3 h-3 fill-[#c9a55a] text-[#c9a55a]" strokeWidth={1} />
                Selected
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[14px] text-[#888] leading-[2] mb-10 max-w-prose font-light tracking-[0.05em]">
            {product.description}
          </p>

          {/* Info badges */}
          <div className="flex flex-wrap gap-4 mb-10">
            <InfoBadge icon={<Truck className="w-4 h-4" />} label="Complimentary Shipping" />
            <InfoBadge icon={<Shield className="w-4 h-4" />} label="Official Warranty" />
            <InfoBadge icon={<RefreshCw className="w-4 h-4" />} label="30-Day Returns" />
          </div>

          {/* Desktop CTA */}
          {!isOutOfStock && waLink && (
            <div className="hidden sm:block mb-10">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 h-[52px] px-8 rounded-sm border border-[#25D366]/30 bg-[#1A3D2B] text-[#25D366] text-[12px] font-normal uppercase tracking-[0.15em] hover:bg-[#25D366]/10 active:scale-[0.98] transition-all duration-300 w-full max-w-sm"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                {isPreorder ? 'Consultar disponibilidad' : 'Comprar por WhatsApp'}
              </a>
            </div>
          )}

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <div className="mb-10">
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278] mb-4">
                Especificaciones técnicas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#2E2925] rounded-sm overflow-hidden">
                {product.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex flex-col px-4 py-3.5 bg-[#1A1714]"
                  >
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/60 mb-1">{spec.key}</span>
                    <span className="text-[13px] text-[#F0EAE0]/90 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <div className="pb-6">
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-tertiary mb-4">
                También te puede interesar
              </h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide -mr-5 pr-5 pb-2">
                {related.map(p => {
                  let rImgs: string[] = []
                  try { if (p.images) rImgs = JSON.parse(p.images) } catch {}
                  const rImg = rImgs[0] || p.imagePath || p.imageUrl
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="flex-shrink-0 w-28 sm:w-32 group"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface mb-2.5 border border-border/40 group-hover:border-primary/30 transition-all duration-500">
                        {rImg ? (
                          <ImageFade src={rImg} alt={p.name} containerClassName="w-full h-full" className="product-img-hover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-tertiary/15" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-[12px] font-medium text-foreground/80 line-clamp-2 leading-snug mb-1">{p.name}</h3>
                      <span className="text-[12px] font-serif italic text-primary">{formatARS(p.price)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <Reviews
            productId={product.id}
            averageRating={reviewData.average}
            totalReviews={reviewData.total}
            distribution={reviewData.distribution || {}}
          />
        </main>
      </div>

      {/* Sticky mobile action bar - Minimal luxury */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#1a1a1a] px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[8px] uppercase tracking-[0.25em] text-[#666] mb-1">PRICE</p>
              <p className="text-xl font-serif italic text-[#c9a55a] leading-none">{formatARS(product.price)}</p>
              {hasDiscount && (
                <p className="text-xs text-[#444] line-through mt-1">{formatARS(product.discountPrice!)}</p>
              )}
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 h-[52px] px-6 bg-[#0f0f0f] text-[#444] rounded-none text-[9px] uppercase tracking-[0.25em] border border-[#1a1a1a] cursor-not-allowed"
              >
                <X className="w-4 h-4" strokeWidth={1} />
                Unavailable
              </button>
            ) : waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-[52px] px-6 rounded-none border border-[#c9a55a] bg-transparent text-[#c9a55a] text-[9px] uppercase tracking-[0.25em] active:scale-[0.99] transition-all duration-300 hover:bg-[#c9a55a] hover:text-[#0a0a0a]"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1} />
                {isPreorder ? 'Inquire' : 'Acquire'}
              </a>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 h-[52px] px-6 bg-[#0f0f0f] text-[#444] rounded-none text-[9px] uppercase tracking-[0.25em] border border-[#1a1a1a]">
                Unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function InfoBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-none bg-[#0f0f0f] border border-[#1a1a1a] text-[9px] uppercase tracking-[0.25em] text-[#666] hover:border-[#2a2a2a] transition-colors duration-300">
      <span className="text-[#c9a55a]/60">{icon}</span>
      {label}
    </span>
  )
}
