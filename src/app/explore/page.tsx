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
    <div className="min-h-screen bg-[#0a0a0a] pb-16 sm:pb-0">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
          <span className="font-serif text-lg font-light tracking-[0.3em] text-[#e8e8e8]">EXPLORE</span>
          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300">
              <Search className="w-4 h-4" strokeWidth={1} />
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <div className="h-16" />

      <main className="px-6 pt-10 pb-8 max-w-7xl mx-auto">
        {/* Categories grid */}
        <section className="mb-12">
          <h2 className="text-[9px] font-normal uppercase tracking-[0.3em] text-[#666] mb-6">CATEGORIES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {parentCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group bg-[#0f0f0f] border border-[#1a1a1a] p-6 transition-all duration-300 hover:border-[#2a2a2a]"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center group-hover:text-[#c9a55a] transition-colors duration-300 text-[#666]">
                  <Package className="w-6 h-6" strokeWidth={1} />
                </div>
                <h3 className="font-serif text-[15px] font-light text-[#e8e8e8] mb-1 tracking-[0.1em]">{cat.name}</h3>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#666]">{cat._count.products} PIECES</p>
                {cat.children.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cat.children.slice(0, 3).map((sub: any) => (
                      <span key={sub.id} className="text-[8px] px-2 py-1 rounded-none bg-[#0f0f0f] text-[#666] border border-[#1a1a1a] uppercase tracking-[0.2em]">
                        {sub.name}
                      </span>
                    ))}
                    {cat.children.length > 3 && (
                      <span className="text-[8px] px-2 py-1 rounded-none bg-[#0f0f0f] text-[#444] border border-[#1a1a1a] uppercase tracking-[0.2em]">
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
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-[9px] font-normal uppercase tracking-[0.3em] text-[#666]">RECENT PIECES</h2>
            <Link href="/" className="text-[9px] uppercase tracking-[0.25em] text-[#666] hover:text-[#c9a55a] transition-colors duration-300 flex items-center gap-2">
              View All <ArrowRight className="w-3 h-3" strokeWidth={1} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {products.map((p, i) => {
              let imgs: string[] = []
              try { if (p.images) imgs = JSON.parse(p.images) } catch {}
              const img = imgs[0] || p.imagePath || p.imageUrl
              return (
                <ScrollReveal key={p.id} delay={Math.min(i * 0.03, 0.2)}>
                  <Link href={`/product/${p.id}`} className="group flex flex-col transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#0f0f0f] mb-4 border border-[#1a1a1a] group-hover:border-[#2a2a2a] transition-colors duration-500">
                      {img ? (
                        <ImageFade src={img} alt={p.name} containerClassName="w-full h-full" className="product-img-hover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#222]" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-[14px] font-light text-[#e8e8e8] leading-[1.3] mb-1 tracking-[0.05em] group-hover:text-[#c9a55a] transition-colors duration-300">{p.name}</h3>
                    <span className="font-serif text-[14px] italic text-[#c9a55a]">{formatARS(p.price)}</span>
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
