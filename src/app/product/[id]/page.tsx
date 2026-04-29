import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatARS, discountPercent } from '@/lib/format'
import { ImageCarousel } from '@/components/ImageCarousel'
import { BottomNav } from '@/components/BottomNav'
import {
  ArrowLeft, Share2, Heart, Star, Package,
  ChevronRight, MessageCircle, X, Check,
} from 'lucide-react'

const siteUrl = process.env.SITE_URL || 'https://catalogo-aura.vercel.app'

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

  const breadcrumb: { label: string; href?: string }[] = []
  if (product.category?.parent) {
    breadcrumb.push({ label: product.category.parent.name })
  }
  if (product.category) {
    breadcrumb.push({ label: product.category.name })
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 8,
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
    AVAILABLE: 'text-[#3cb371] bg-[#3cb371]/8 border-[#3cb371]/20',
    PREORDER: 'text-[#d4a030] bg-[#d4a030]/8 border-[#d4a030]/20',
    OUT_OF_STOCK: 'text-[#e05555] bg-[#e05555]/8 border-[#e05555]/20',
  }
  const statusLabels = {
    AVAILABLE: 'Disponible',
    PREORDER: 'Por pedido',
    OUT_OF_STOCK: 'Sin stock',
  }

  const hasDiscount = product.discountPrice && product.discountPrice > product.price

  return (
    <div className="min-h-screen bg-[#060606] pb-28 sm:pb-0">
      {/* Floating header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between h-11 px-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white/80" />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 max-w-[180px]">
              <span className="text-xs font-medium text-white/50 truncate block text-center">
                {product.name}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
                <Share2 className="w-3.5 h-3.5 text-white/70" />
              </button>
              <button className="w-8 h-8 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
                <Heart className="w-3.5 h-3.5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ImageCarousel images={images} alt={product.name} />

      <main className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
        {/* Breadcrumb + Status */}
        <div className="flex items-center justify-between mb-4">
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/30">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3 opacity-50" />}
                  <span className={i === breadcrumb.length - 1 ? 'text-white/45' : ''}>{item.label}</span>
                </span>
              ))}
            </div>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusStyles[product.status as keyof typeof statusStyles] || statusStyles.AVAILABLE}`}>
            {statusLabels[product.status as keyof typeof statusLabels] || product.status}
          </span>
        </div>

        {/* Name */}
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white leading-[1.15] tracking-tight mb-3">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-2xl font-bold text-[#bf9b4e]">{formatARS(product.price)}</span>
          {hasDiscount && (
            <>
              <span className="text-base text-white/25 line-through">{formatARS(product.discountPrice!)}</span>
              <span className="text-sm font-bold text-[#e05555]">
                -{discountPercent(product.price, product.discountPrice!)}%
              </span>
            </>
          )}
          {product.featured && !hasDiscount && (
            <span className="inline-flex items-center gap-1 text-sm text-[#bf9b4e]/60">
              <Star className="w-3.5 h-3.5 fill-[#bf9b4e] text-[#bf9b4e]" />
              Destacado
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-base text-white/50 leading-relaxed mb-6 max-w-prose">
          {product.description}
        </p>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2 mb-7">
          <InfoBadge label="Envío gratis" />
          <InfoBadge label="Garantía incluida" />
          <InfoBadge label="30 días devolución" />
        </div>

        {/* Desktop CTA (hidden on mobile — use sticky bar) */}
        {!isOutOfStock && waLink && (
          <div className="hidden sm:block mb-8">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-white text-[#060606] text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg shadow-white/5"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              {isPreorder ? 'Consultar por WhatsApp' : 'Comprar por WhatsApp'}
            </a>
          </div>
        )}

        {/* Specifications */}
        {product.specifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30 mb-3">
              Especificaciones técnicas
            </h2>
            <div className="rounded-2xl border border-[#1a1a1a] overflow-hidden">
              {product.specifications.map((spec, i) => (
                <div
                  key={spec.id}
                  className={`flex items-baseline justify-between px-4 py-3 ${i > 0 ? 'border-t border-[#1a1a1a]/60' : ''}`}
                >
                  <span className="text-sm text-white/35 flex-shrink-0 mr-4">{spec.key}</span>
                  <span className="text-sm text-white/75 text-right font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30 mb-3">
              También te puede interesar
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-1">
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
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/20 transition-all">
                      {rImg ? (
                        <img src={rImg} alt={p.name} className="w-full h-full object-cover product-img-hover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-white/10" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-medium text-white/80 line-clamp-2 leading-snug">{p.name}</h3>
                    <span className="text-xs font-semibold text-[#bf9b4e] mt-0.5 block">{formatARS(p.price)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Sticky mobile action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden">
        <div className="glass border-t border-[#1a1a1a] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-white/30 mb-0.5">Precio</p>
              <p className="text-lg font-bold text-white leading-none">{formatARS(product.price)}</p>
              {hasDiscount && (
                <p className="text-xs text-white/30 line-through mt-0.5">{formatARS(product.discountPrice!)}</p>
              )}
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-1.5 h-12 px-5 bg-[#0d0d0d] text-white/25 rounded-xl text-sm font-semibold border border-[#1a1a1a] cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Agotado
              </button>
            ) : waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-12 px-5 bg-white text-[#060606] rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-white/5"
              >
                <MessageCircle className="w-4 h-4" />
                {isPreorder ? 'Consultar' : 'Comprar'}
              </a>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 h-12 px-5 bg-[#0d0d0d] text-white/25 rounded-xl text-sm border border-[#1a1a1a]">
                Sin WhatsApp
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function InfoBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] text-xs text-white/40 font-medium">
      <Check className="w-3 h-3 text-[#bf9b4e]/60" />
      {label}
    </span>
  )
}
