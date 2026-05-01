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
    <div className="min-h-screen bg-[#1A1714] selection:bg-[#C9A55A]/20 pb-16 sm:pb-0">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#161310] border-b border-[#2E2925]">
          <div className="flex justify-between items-center h-11 px-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-2">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings?.siteName || 'Aura'}
                    className="w-6 h-6 rounded-sm object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-sm bg-[#C9A55A]/15 border border-[#C9A55A]/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#C9A55A]">
                      {(settings?.siteName || 'A')[0]}
                    </span>
                  </div>
                )}
                <span className="font-serif text-sm font-light tracking-[0.02em] text-[#F0EAE0]">
                  {settings?.siteName || 'Aura'}
                </span>
                {settings?.siteTagline && (
                  <span className="hidden sm:inline text-[10px] font-normal uppercase tracking-[0.15em] text-[#8A8278] ml-1">
                    {settings.siteTagline}
                  </span>
                )}
              </Link>

              <nav className="hidden md:flex items-center gap-5">
                <Link href="/" className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#C9A55A] transition-colors duration-300">Inicio</Link>
                <Link href="/explore" className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#C9A55A] transition-colors duration-300">Explorar</Link>
                <Link href="/search" className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#C9A55A] transition-colors duration-300">Buscar</Link>
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <Link href="/search" className="p-2 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 rounded-sm">
                <Search className="w-4 h-4" />
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="h-11" />

      <main>
        {/* Hero */}
        <section className="px-4 pt-10 pb-6 border-b border-[#2E2925]/50 max-w-7xl mx-auto">
          <p className="text-[11px] font-normal uppercase tracking-[0.15em] text-[#C9A55A]/70 mb-3">
            {settings?.siteTagline || 'Catálogo Premium'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.08] font-light text-[#F0EAE0] tracking-[0.02em] max-w-2xl">
            {settings?.heroTitle || 'Productos que importan'}
          </h1>
          <p className="mt-4 text-base text-[#8A8278] leading-[1.8] max-w-lg font-light">
            {settings?.heroSubtitle || 'Selección curada de tecnología, audio, accesorios y moda. Calidad sobre cantidad.'}
          </p>
          <div className="flex items-center gap-5 mt-6">
            <div className="h-px flex-1 bg-[#2E2925]" />
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#8A8278] font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3cb371] inline-block" />
              Envío gratis
            </div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#8A8278] font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] inline-block" />
              Curaduría experta
            </div>
            <div className="h-px flex-1 bg-[#2E2925]" />
          </div>
        </section>

        <Suspense
          fallback={
            <div className="px-4 pt-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-[#221E1A] animate-pulse" />
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
