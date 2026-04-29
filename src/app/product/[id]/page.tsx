import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ImageCarousel } from '@/components/ImageCarousel'
import { BottomNav } from '@/components/BottomNav'
import {
  ArrowLeft, Share2, Heart, Star, Package,
  ChevronRight, MessageCircle, Check, X
} from 'lucide-react'

const siteUrl = process.env.SITE_URL || "https://catalogo-aura.vercel.app"

function getProductImages(product: any): string[] {
  let images: string[] = []
  try { if (product.images) images = JSON.parse(product.images) } catch {}
  if (images.length === 0) {
    const legacy = product.imagePath || product.imageUrl
    if (legacy) images = [legacy]
  }
  return images
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "Este producto no existe o fue eliminado.",
    }
  }

  const images = getProductImages(product)
  const title = `${product.name} — $${product.price.toFixed(2)}`
  const description = product.description.length > 160
    ? product.description.substring(0, 157) + "..."
    : product.description
  const imageUrl = images[0] || `${siteUrl}/og-image.png`
  const productUrl = `${siteUrl}/product/${product.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: productUrl,
      type: "article",
      images: [
        {
          url: imageUrl.startsWith("http") ? imageUrl : `${siteUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      siteName: "Aura — Catálogo Premium",
      locale: "es_AR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl.startsWith("http") ? imageUrl : `${siteUrl}${imageUrl}`],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: { include: { parent: true } },
        specifications: true,
      }
    }),
    prisma.siteSettings.findFirst()
  ])

  if (!product) notFound()

  const images = getProductImages(product)

  const breadcrumb: string[] = []
  if (product.category?.parent) breadcrumb.push(product.category.parent.name)
  if (product.category) breadcrumb.push(product.category.name)

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 6,
    include: { category: true },
  })

  const waNumber = settings?.whatsappNumber?.replace(/\D/g, '')
  const waMessage = encodeURIComponent(`${settings?.whatsappMessage || 'Hola, quiero información sobre:'} ${product.name} ($${product.price.toFixed(2)})`)
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null

  const statusLabels = { AVAILABLE: 'Disponible', PREORDER: 'Por pedido', OUT_OF_STOCK: 'Sin stock' }
  const statusStyles = {
    AVAILABLE: 'bg-[#3cb371]/10 text-[#3cb371] border-[#3cb371]/20',
    PREORDER: 'bg-[#d4a030]/10 text-[#d4a030] border-[#d4a030]/20',
    OUT_OF_STOCK: 'bg-[#e05555]/10 text-[#e05555] border-[#e05555]/20',
  }

  return (
    <div className="min-h-screen bg-[#060606] pb-16 sm:pb-0">
      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between h-11 px-3">
            <Link href="/" className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/80" />
            </Link>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
                <Share2 className="w-3.5 h-3.5 text-white/80" />
              </button>
              <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
                <Heart className="w-3.5 h-3.5 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ImageCarousel images={images} alt={product.name} />

      <main className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
        {/* Breadcrumb + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-[11px] text-white/35">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === breadcrumb.length - 1 ? 'text-white/50' : ''}>{item}</span>
              </span>
            ))}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[product.status as keyof typeof statusStyles]}`}>
            {statusLabels[product.status as keyof typeof statusLabels]}
          </span>
        </div>

        {/* Name + Price */}
        <div className="mb-4">
          <h1 className="font-serif text-[22px] font-medium text-white leading-[1.2] tracking-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xl font-bold text-[#bf9b4e]">${product.price.toFixed(2)}</span>
            {product.featured && (
              <span className="inline-flex items-center gap-1 text-[12px] text-[#bf9b4e]/70">
                <Star className="w-3 h-3 fill-[#bf9b4e] text-[#bf9b4e]" />
                Destacado
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-white/45 leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <InfoBadge label="Envío gratis" />
          <InfoBadge label="Garantía" />
          <InfoBadge label="30 días devolución" />
        </div>

        {/* Specifications */}
        {product.specifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35 mb-3">Especificaciones</h2>
            <div className="rounded-2xl border border-[#1a1a1a] overflow-hidden divide-y divide-[#1a1a1a]">
              {product.specifications.map(spec => (
                <div key={spec.id} className="flex justify-between px-4 py-3">
                  <span className="text-[12px] text-white/35">{spec.key}</span>
                  <span className="text-[12px] text-white/70 text-right font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35 mb-3">Relacionados</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-4 pr-4 pb-1">
              {related.map(p => {
                let rImgs: string[] = []
                try { if (p.images) rImgs = JSON.parse(p.images) } catch {}
                const rImg = rImgs[0] || p.imagePath || p.imageUrl
                return (
                  <Link key={p.id} href={`/product/${p.id}`} className="flex-shrink-0 w-28 group">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/20 transition-all">
                      {rImg ? <img src={rImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" /> : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-white/10" /></div>
                      )}
                    </div>
                    <h3 className="text-[10px] font-medium text-white/80 line-clamp-1">{p.name}</h3>
                    <span className="text-[10px] font-semibold text-[#bf9b4e]">${p.price.toFixed(2)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="glass border-t border-[#1a1a1a] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/25">Precio</span>
              <div className="text-lg font-bold text-white">${product.price.toFixed(2)}</div>
            </div>
            {product.status === 'OUT_OF_STOCK' ? (
              <button disabled className="flex items-center gap-1.5 px-5 py-3 bg-[#111] text-white/25 rounded-xl text-sm font-semibold border border-[#1a1a1a] cursor-not-allowed">
                <X className="w-4 h-4" />
                Agotado
              </button>
            ) : waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-white text-[#060606] rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-white/5"
              >
                <MessageCircle className="w-4 h-4" />
                {product.status === 'PREORDER' ? 'Pedir' : 'Comprar'}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function InfoBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#111] border border-[#1a1a1a] text-[10px] text-white/40 font-medium">
      <Check className="w-3 h-3 text-[#bf9b4e]/70" />
      {label}
    </span>
  )
}
