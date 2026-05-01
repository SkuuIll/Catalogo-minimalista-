import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatARS } from '@/lib/format'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { MobileMenu } from '@/components/MobileMenu'
import { ImageFade } from '@/components/ImageFade'
import { Search, Package, ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'

export default async function ExplorePage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: { children: true, _count: { select: { products: true } } },
  })
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
    take: 16,
  })
  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-[#1A1714] pb-16 sm:pb-0">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161310]/95 backdrop-blur-md border-b border-[#2E2925]/60">
        <div className="flex justify-between items-center h-11 px-4 max-w-7xl mx-auto">
          <span className="font-serif text-sm font-light tracking-[0.02em] text-[#F0EAE0]">Explorar</span>
          <div className="flex items-center gap-1">
            <Link href="/search" className="p-2 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 rounded-sm">
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <div className="h-11" />

      <main className="px-4 pt-6 pb-8 max-w-7xl mx-auto">
        {/* Categories grid */}
        <section className="mb-10">
          <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278] mb-4">Categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {parentCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group bg-[#221E1A] border border-[#2E2925]/60 hover:border-[#3D3830] rounded-sm p-4 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-9 h-9 rounded-sm bg-[#2A2520] border border-[#2E2925] flex items-center justify-center mb-3 group-hover:border-[#C9A55A]/20 transition-colors duration-300">
                  <Package className="w-4 h-4 text-[#8A8278] group-hover:text-[#C9A55A]/60 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-[#F0EAE0] mb-0.5">{cat.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#8A8278]/60">{cat._count.products} productos</p>
                {cat.children.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cat.children.slice(0, 3).map((sub: any) => (
                      <span key={sub.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2520] text-[#8A8278]/70 border border-[#2E2925]">
                        {sub.name}
                      </span>
                    ))}
                    {cat.children.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2520] text-[#8A8278]/40 border border-[#2E2925]">
                        +{cat.children.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Recent products */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8A8278]">Recientes</h2>
            <Link href="/" className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((p, i) => {
              let imgs: string[] = []
              try { if (p.images) imgs = JSON.parse(p.images) } catch {}
              const img = imgs[0] || p.imagePath || p.imageUrl
              return (
                <ScrollReveal key={p.id} delay={Math.min(i * 0.03, 0.2)}>
                  <Link href={`/product/${p.id}`} className="group flex flex-col transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#221E1A] mb-2.5 border border-[#2E2925]/40 group-hover:border-[#C9A55A]/30 transition-all duration-500">
                      {img ? (
                        <ImageFade src={img} alt={p.name} containerClassName="w-full h-full" className="product-img-hover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#8A8278]/15" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <h3 className="text-[13px] font-medium text-[#F0EAE0]/90 line-clamp-2 leading-snug mb-1">{p.name}</h3>
                    <span className="text-[13px] font-serif italic text-[#C9A55A]">{formatARS(p.price)}</span>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </section>
      </main>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  )
}
