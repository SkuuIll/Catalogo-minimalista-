import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageCarousel } from '@/components/ImageCarousel'
import { BottomNav } from '@/components/BottomNav'
import {
  ArrowLeft, Share2, Heart, Star, Package,
  Check, Shield, Truck, RotateCcw, ChevronRight
} from 'lucide-react'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { include: { parent: true } },
      specifications: true,
    }
  })

  if (!product) notFound()

  // Parsear múltiples imágenes
  let images: string[] = []
  try {
    if (product.images) {
      images = JSON.parse(product.images)
    }
  } catch {
    images = []
  }
  // Fallback a imagen legacy
  if (images.length === 0) {
    const legacy = product.imagePath || product.imageUrl
    if (legacy) images = [legacy]
  }

  const breadcrumb = []
  if (product.category?.parent) breadcrumb.push(product.category.parent.name)
  if (product.category) breadcrumb.push(product.category.name)

  // Productos relacionados (misma categoría)
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 6,
    include: { category: true },
  })

  return (
    <div className="min-h-screen bg-background text-on-surface sm:pb-0 pb-24">
      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong border-b border-white/[0.06]">
          <div className="flex items-center justify-between h-12 px-4">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors">
                <Share2 className="w-4 h-4 text-white" />
              </button>
              <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors">
                <Heart className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Carrusel de imágenes */}
      <div>
        <ImageCarousel images={images} alt={product.name} />
      </div>

      <main className="px-4 sm:px-6 max-w-3xl mx-auto -mt-4 relative z-10">
        <div className="glass-strong rounded-2xl sm:rounded-3xl border border-white/[0.06] p-4 sm:p-6 shadow-2xl shadow-black/20">
          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3 text-[11px] text-on-surface-variant/50">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  <span>{item}</span>
                </span>
              ))}
            </div>
          )}

          {/* Nombre y precio */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="font-serif text-xl sm:text-2xl font-medium text-on-surface leading-tight">
              {product.name}
            </h1>
            <div className="text-right flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
              {product.featured && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-[10px] text-primary font-medium">Destacado</span>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <p className="text-sm text-on-surface-variant/70 leading-relaxed mb-5">
            {product.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge icon={<Truck className="w-3 h-3" />} text="Envío gratis" />
            <Badge icon={<Shield className="w-3 h-3" />} text="Garantía" />
            <Badge icon={<RotateCcw className="w-3 h-3" />} text="30 días devolución" />
          </div>

          {/* Especificaciones */}
          {product.specifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Especificaciones
              </h2>
              <div className="rounded-xl border border-white/[0.04] overflow-hidden divide-y divide-white/[0.04]">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-on-surface-variant/60">{spec.key}</span>
                    <span className="text-xs font-medium text-on-surface text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productos relacionados */}
          {related.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-on-surface mb-3">También te puede gustar</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
                {related.map((p) => {
                  let pImages: string[] = []
                  try { if (p.images) pImages = JSON.parse(p.images) } catch {}
                  const pImg = pImages[0] || p.imagePath || p.imageUrl
                  return (
                    <Link key={p.id} href={`/product/${p.id}`} className="flex-shrink-0 w-28 sm:w-32 group">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface ring-1 ring-white/[0.04] mb-1.5">
                        {pImg ? (
                          <img src={pImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container">
                            <Package className="w-5 h-5 text-on-surface-variant/20" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-[11px] font-medium text-on-surface line-clamp-1">{p.name}</h3>
                      <span className="text-[11px] text-primary font-semibold">${p.price.toFixed(2)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="glass-strong border-t border-white/[0.06] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-on-surface-variant/50">Total</span>
              <div className="text-lg font-bold text-primary">${product.price.toFixed(2)}</div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              <Check className="w-4 h-4" />
              Contactar
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container border border-white/[0.04]">
      <span className="text-primary">{icon}</span>
      <span className="text-[10px] font-medium text-on-surface-variant">{text}</span>
    </div>
  )
}
