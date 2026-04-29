import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatARS } from '@/lib/format'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { MobileMenu } from '@/components/MobileMenu'
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
    <div className="min-h-screen bg-[#060606] pb-16 sm:pb-0">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex justify-between items-center h-11 px-4 max-w-7xl mx-auto">
          <span className="font-serif text-sm font-medium text-white">Explorar</span>
          <div className="flex items-center gap-1">
            <Link href="/search" className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-lg">
              <Search className="w-4 h-4" />
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <div className="h-11" />

      <main className="px-4 pt-6 pb-8 max-w-7xl mx-auto">
        {/* Categories grid */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-4">Categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {parentCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group bg-[#0d0d0d] border border-[#1a1a1a] hover:border-white/10 rounded-2xl p-4 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-3 group-hover:border-[#bf9b4e]/20 transition-all">
                  <Package className="w-4 h-4 text-white/25 group-hover:text-[#bf9b4e]/60 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{cat.name}</h3>
                <p className="text-xs text-white/35">{cat._count.products} productos</p>
                {cat.children.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cat.children.slice(0, 3).map((sub: any) => (
                      <span key={sub.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#111] text-white/30 border border-[#1a1a1a]">
                        {sub.name}
                      </span>
                    ))}
                    {cat.children.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111] text-white/20 border border-[#1a1a1a]">
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Recientes</h2>
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((p, i) => {
              let imgs: string[] = []
              try { if (p.images) imgs = JSON.parse(p.images) } catch {}
              const img = imgs[0] || p.imagePath || p.imageUrl
              return (
                <ScrollReveal key={p.id} delay={Math.min(i * 0.03, 0.2)}>
                  <Link href={`/product/${p.id}`} className="group flex flex-col active:scale-[0.97] transition-transform">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2.5 border border-[#1a1a1a]/50 group-hover:border-[#bf9b4e]/20 transition-all duration-500">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover product-img-hover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-white/10" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-snug">{p.name}</h3>
                    <span className="text-sm font-semibold text-[#bf9b4e] mt-1">{formatARS(p.price)}</span>
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
