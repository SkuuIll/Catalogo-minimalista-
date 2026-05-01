import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatARS, discountPercent } from '@/lib/format'
import { ImageCarousel } from '@/components/ImageCarousel'
import { BottomNav } from '@/components/BottomNav'
import { ImageFade } from '@/components/ImageFade'
import {
  ArrowLeft, Share2, Heart, Star, Package,
  ChevronRight, MessageCircle, X, Check, Truck, Shield, RefreshCw
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
    AVAILABLE: 'text-[#3cb371] bg-[#3cb371]/8 border-[#3cb371]/20',
    PREORDER: 'text-[#C9A55A] bg-[#C9A55A]/8 border-[#C9A55A]/20',
    OUT_OF_STOCK: 'text-[#C0392B] bg-[#C0392B]/8 border-[#C0392B]/20',
  }
  const statusLabels = {
    AVAILABLE: 'Disponible',
    PREORDER: 'Por pedido',
    OUT_OF_STOCK: 'Sin stock',
  }

  const hasDiscount = product.discountPrice && product.discountPrice > product.price

  return (
    <div className="min-h-screen bg-[#1A1714] pb-28 sm:pb-0">
      {/* Floating header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#161310]/95 backdrop-blur-md border-b border-[#2E2925]/60">
          <div className="flex items-center justify-between h-11 px-3 max-w-7xl mx-auto">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-[#1A1714]/80 flex items-center justify-center hover:bg-[#2A2520] transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 text-[#8A8278]" strokeWidth={1.5} />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 max-w-[200px]">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/70 truncate block text-center">
                {product.name}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-full bg-[#1A1714]/80 flex items-center justify-center hover:bg-[#2A2520] transition-colors duration-300">
                <Share2 className="w-3.5 h-3.5 text-[#8A8278]" strokeWidth={1.5} />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#1A1714]/80 flex items-center justify-center hover:bg-[#2A2520] transition-colors duration-300">
                <Heart className="w-3.5 h-3.5 text-[#8A8278]" strokeWidth={1.5} />
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
        <main className="px-5 pt-6 pb-6 sm:pt-14 sm:px-8 lg:px-12">
          {/* Breadcrumb + Status */}
          <div className="flex items-center justify-between mb-5">
            {breadcrumb.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/60">
                {breadcrumb.map((item, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="w-3 h-3 opacity-40" />}
                    <span className={i === breadcrumb.length - 1 ? 'text-[#8A8278]' : ''}>{item.label}</span>
                  </span>
                ))}
              </div>
            )}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-normal uppercase tracking-[0.15em] border ${statusStyles[product.status as keyof typeof statusStyles] || statusStyles.AVAILABLE}`}>
              {statusLabels[product.status as keyof typeof statusLabels] || product.status}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-serif text-2xl sm:text-[28px] font-light text-[#F0EAE0] leading-[1.2] tracking-[0.02em] mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#2E2925]/60">
            <span className="text-[26px] font-serif italic text-[#C9A55A] leading-none">{formatARS(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-[15px] text-[#8A8278]/40 line-through">{formatARS(product.discountPrice!)}</span>
                <span className="text-[12px] font-normal text-[#C0392B] uppercase tracking-[0.1em]">
                  -{discountPercent(product.price, product.discountPrice!)}% OFF
                </span>
              </>
            )}
            {product.featured && !hasDiscount && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[#C9A55A]/50">
                <Star className="w-3 h-3 fill-[#C9A55A] text-[#C9A55A]" />
                Destacado
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[15px] text-[#8A8278] leading-[1.8] mb-7 max-w-prose font-light">
            {product.description}
          </p>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <InfoBadge icon={<Truck className="w-3 h-3" />} label="Envío gratis" />
            <InfoBadge icon={<Shield className="w-3 h-3" />} label="Garantía incluida" />
            <InfoBadge icon={<RefreshCw className="w-3 h-3" />} label="30 días devolución" />
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
              <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278] mb-4">
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
                      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#221E1A] mb-2.5 border border-[#2E2925]/40 group-hover:border-[#C9A55A]/30 transition-all duration-500">
                        {rImg ? (
                          <ImageFade src={rImg} alt={p.name} containerClassName="w-full h-full" className="product-img-hover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#8A8278]/15" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-[12px] font-medium text-[#F0EAE0]/80 line-clamp-2 leading-snug mb-1">{p.name}</h3>
                      <span className="text-[12px] font-serif italic text-[#C9A55A]">{formatARS(p.price)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden">
        <div className="bg-[#161310]/95 backdrop-blur-md border-t border-[#2E2925]/60 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/50 mb-0.5">Precio</p>
              <p className="text-lg font-serif italic text-[#F0EAE0] leading-none">{formatARS(product.price)}</p>
              {hasDiscount && (
                <p className="text-xs text-[#8A8278]/40 line-through mt-0.5">{formatARS(product.discountPrice!)}</p>
              )}
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-1.5 h-[48px] px-5 bg-[#221E1A] text-[#8A8278]/30 rounded-sm text-[11px] uppercase tracking-[0.15em] border border-[#2E2925] cursor-not-allowed"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
                Agotado
              </button>
            ) : waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-[48px] px-5 rounded-sm border border-[#25D366]/30 bg-[#1A3D2B] text-[#25D366] text-[11px] uppercase tracking-[0.15em] active:scale-[0.97] transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                {isPreorder ? 'Consultar' : 'Comprar'}
              </a>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 h-[48px] px-5 bg-[#221E1A] text-[#8A8278]/30 rounded-sm text-[11px] uppercase tracking-[0.15em] border border-[#2E2925]">
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

function InfoBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#221E1A] border border-[#2E2925]/60 text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/70 font-normal">
      <span className="text-[#C9A55A]/50">{icon}</span>
      {label}
    </span>
  )
}
