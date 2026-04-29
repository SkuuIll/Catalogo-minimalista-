import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import { CatalogClient } from './CatalogClient'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  })

  const settings = await prisma.siteSettings.findFirst()

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-serif text-sm font-bold text-primary">A</span>
                </div>
                <span className="font-serif text-lg font-medium tracking-tight text-on-surface">
                  {settings?.siteName || 'Aura'}
                </span>
              </Link>
              <div className="flex items-center gap-3 sm:gap-5">
                <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
                  <span>Admin</span>
                </Link>
                <Link href="/login" className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] text-primary hover:bg-primary/20 transition-all">
                  Entrar
                </Link>
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14 sm:h-16" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-6 sm:pt-10 pb-24 sm:pb-16">
        {/* Hero */}
        <section className="mb-8 sm:mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-4 sm:mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {settings?.siteTagline || 'Minimalist'}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.05] font-medium text-on-surface mb-3 sm:mb-4">
            {settings?.heroTitle || 'Curaduría de Objetos Esenciales'}
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant font-light leading-relaxed max-w-lg">
            {settings?.heroSubtitle || 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno.'}
          </p>
        </section>

        <CatalogClient products={products} categories={categories} />
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-white/[0.04] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="font-serif text-[10px] font-bold text-primary">A</span>
            </div>
            <span className="font-serif text-sm text-on-surface-variant">
              {settings?.siteName || 'Aura'}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/40 font-light tracking-widest uppercase">
            © 2026 {settings?.siteName || 'Aura'} Collective
          </span>
        </div>
      </footer>
    </div>
  )
}
