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
      {/* Navegación */}
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-primary">
                {settings?.siteName || 'Aura'}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant pt-1 hidden sm:inline">
                {settings?.siteTagline || 'Minimalist'}
              </span>
            </Link>
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/admin" className="hidden sm:block text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">
                Admin
              </Link>
              <Link href="/login" className="px-4 sm:px-6 py-2 border border-primary/20 rounded-full text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all">
                Entrar
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-10 sm:py-16 lg:py-20">
        {/* Hero */}
        <header className="mb-10 sm:mb-16 lg:mb-20 max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-medium text-on-surface mb-4 sm:mb-6">
            {settings?.heroTitle || 'Curaduría de Objetos Esenciales'}
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant font-light leading-relaxed">
            {settings?.heroSubtitle || 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno.'}
          </p>
        </header>

        <CatalogClient products={products} categories={categories} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 sm:py-16 mt-10 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div>
            <span className="font-serif text-xl sm:text-2xl font-medium text-primary">
              {settings?.siteName || 'Aura'}
            </span>
          </div>
          <div className="text-[11px] sm:text-[12px] text-on-surface-variant/50 font-light tracking-widest uppercase text-center sm:text-right">
            © 2026 {settings?.siteName || 'Aura'} Collective. Catálogo Minimalista.
          </div>
        </div>
      </footer>
    </div>
  )
}
