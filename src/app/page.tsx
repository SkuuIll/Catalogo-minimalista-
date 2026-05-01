import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { CatalogClient } from './CatalogClient'
import { Search } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { order: 'asc' },
      include: { children: true },
    }),
    prisma.siteSettings.findFirst(),
  ])

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-[#c9a55a]/20 pb-16 sm:pb-0">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a]">
          <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-4 group">
              <div>
                <span className="font-serif text-xl font-light tracking-[0.3em] text-[#e8e8e8] block">
                  {settings?.siteName || 'SHOWROOM JR'}
                </span>
                {settings?.siteTagline && (
                  <span className="text-[8px] uppercase tracking-[0.4em] text-[#666] block mt-0.5">
                    {settings.siteTagline}
                  </span>
                )}
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-[#c9a55a] transition-colors duration-300">Collection</Link>
              <Link href="/explore" className="text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-[#c9a55a] transition-colors duration-300">Categories</Link>
              <Link href="/search" className="text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-[#c9a55a] transition-colors duration-300">Search</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/search" className="p-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300">
                <Search className="w-4 h-4" strokeWidth={1} />
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="h-16" />

      <main>
        {/* Hero - Luxury style */}
        <section className="relative px-6 pt-20 pb-16 border-b border-[#1a1a1a] max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-[9px] font-normal uppercase tracking-[0.4em] text-[#c9a55a]/80 mb-6">
              {settings?.siteTagline || 'Catálogo Premium'}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[#e8e8e8] tracking-[0.2em] max-w-4xl mx-auto leading-[1.1]">
              {settings?.heroTitle || 'CURATED OBJECTS'}
            </h1>
            <p className="mt-6 text-sm text-[#888] leading-[2] max-w-xl mx-auto font-light tracking-[0.05em]">
              {settings?.heroSubtitle || 'Selección curada de piezas excepcionales para el estilo de vida moderno.'}
            </p>
            
            {/* Divider */}
            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#1a1a1a]" />
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#444]">EST. 2026</div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#1a1a1a]" />
            </div>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="px-6 pt-12 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[#0f0f0f] animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <CatalogClient products={products} categories={categories} />
        </Suspense>
      </main>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  )
}
