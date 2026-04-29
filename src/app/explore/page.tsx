import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { MobileMenu } from '@/components/MobileMenu'
import { Search, Package, Grid3X3, ArrowRight } from 'lucide-react'

export default async function ExplorePage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: { children: true, _count: { select: { products: true } } }
  })
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
    take: 16
  })
  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-[#060606] pb-14">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex justify-between items-center h-11 px-4">
          <span className="font-serif text-sm font-medium text-white">Explorar</span>
          <div className="flex items-center gap-1">
            <Link href="/search" className="p-1.5 text-white/40 hover:text-white/80 transition-colors">
              <Search className="w-4.5 h-4.5" />
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <div className="h-11" />

      <main className="px-4 pt-5 pb-8">
        {/* Categories grid */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35 mb-4">Categorías</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {parentCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group bg-[#0d0d0d] border border-[#1a1a1a] hover:border-white/10 rounded-2xl p-4 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#111] flex items-center justify-center mb-3">
                  <Grid3X3 className="w-4 h-4 text-white/30" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{cat.name}</h3>
                <p className="text-[11px] text-white/35">{cat._count.products} productos</p>
                {cat.children.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cat.children.slice(0, 3).map((sub: any) => (
                      <span key={sub.id} className="text-[9px] px-2 py-0.5 rounded-full bg-[#111] text-white/30 border border-[#1a1a1a]">{sub.name}</span>
                    ))}
                    {cat.children.length > 3 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#111] text-white/20 border border-[#1a1a1a]">+{cat.children.length - 3}</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Recent products */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">Recientes</h2>
            <Link href="/" className="text-[11px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => {
              let imgs: string[] = []
              try { if (p.images) imgs = JSON.parse(p.images) } catch {}
              const img = imgs[0] || p.imagePath || p.imageUrl
              return (
                <Link key={p.id} href={`/product/${p.id}`} className="group flex flex-col active:scale-[0.98] transition-transform">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d0d0d] mb-2 border border-[#1a1a1a]/50">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-white/10" /></div>
                    )}
                  </div>
                  <h3 className="text-[12px] font-medium text-white/90 line-clamp-1">{p.name}</h3>
                  <span className="text-[12px] font-semibold text-[#bf9b4e] mt-0.5">${p.price.toFixed(2)}</span>
                </Link>
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
