import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { CatalogClient } from './CatalogClient'
import { Search, Bell } from 'lucide-react'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })

  const categories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { order: 'asc' },
    include: { children: true }
  })

  const settings = await prisma.siteSettings.findFirst()

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 sm:pb-0 pb-16">
      {/* Header tipo app móvil */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-12 sm:h-14">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="font-serif text-xs font-bold text-primary">A</span>
                </div>
                <span className="font-serif text-base font-medium tracking-tight text-on-surface">
                  {settings?.siteName || 'Aura'}
                </span>
              </Link>
              <div className="flex items-center gap-1">
                <Link href="/search" className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <Search className="w-5 h-5" />
                </Link>
                <button className="hidden sm:flex p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-12 sm:h-14" />

      <main className="max-w-7xl mx-auto px-0 sm:px-6">
        {/* Hero compacto tipo app */}
        <section className="px-4 sm:px-0 pt-4 sm:pt-8 pb-4 sm:pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {settings?.siteTagline || 'Catálogo Premium'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl leading-[1.05] font-medium text-on-surface">
            {settings?.heroTitle || 'Curaduría de Objetos Esenciales'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-on-surface-variant/70 leading-relaxed max-w-md">
            {settings?.heroSubtitle || 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno.'}
          </p>
        </section>

        <CatalogClient products={products} categories={categories} />
      </main>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  )
}
