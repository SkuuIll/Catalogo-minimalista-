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
    take: 20
  })

  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 sm:pb-0 pb-20">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-12 sm:h-14">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="font-serif text-xs font-bold text-primary">A</span>
                </div>
                <span className="font-serif text-base font-medium tracking-tight text-on-surface">Explorar</span>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/search" className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <Search className="w-5 h-5" />
                </Link>
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-12 sm:h-14" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        {/* Todas las categorías */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-medium text-on-surface mb-4">Categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {parentCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group glass p-4 rounded-2xl border border-white/[0.06] hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-on-surface mb-1">{cat.name}</h3>
                <p className="text-[11px] text-on-surface-variant/50">{cat._count.products} productos</p>
                {cat.children.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cat.children.slice(0, 3).map((sub: any) => (
                      <span key={sub.id} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant/60 border border-white/[0.04]">
                        {sub.name}
                      </span>
                    ))}
                    {cat.children.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant/40 border border-white/[0.04]">
                        +{cat.children.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Recientes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-medium text-on-surface">Recientes</h2>
            <Link href="/" className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => {
              const images = product.images ? JSON.parse(product.images) : []
              const imageUrl = images[0] || product.imagePath || product.imageUrl
              return (
                <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col">
                  <div className="relative aspect-[3/4] bg-surface overflow-hidden rounded-xl mb-2 ring-1 ring-white/[0.04] group-active:scale-[0.98] transition-transform duration-150">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container">
                        <Package className="w-6 h-6 text-on-surface-variant/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-on-surface line-clamp-1">{product.name}</h3>
                  <span className="text-xs font-bold text-primary mt-0.5">${product.price.toFixed(2)}</span>
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
