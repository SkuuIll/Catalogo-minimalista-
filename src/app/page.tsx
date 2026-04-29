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
    <div className="min-h-screen bg-[#060606] selection:bg-[#bf9b4e]/20 pb-16 sm:pb-0">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass border-b border-[#1a1a1a]">
          <div className="flex justify-between items-center h-11 px-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-2">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings?.siteName || 'Aura'}
                    className="w-6 h-6 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-[#bf9b4e]/15 border border-[#bf9b4e]/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#bf9b4e]">
                      {(settings?.siteName || 'A')[0]}
                    </span>
                  </div>
                )}
                <span className="font-serif text-sm font-medium tracking-tight text-white">
                  {settings?.siteName || 'Aura'}
                </span>
                {settings?.siteTagline && (
                  <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 ml-1">
                    {settings.siteTagline}
                  </span>
                )}
              </Link>

              <nav className="hidden md:flex items-center gap-5">
                <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">Inicio</Link>
                <Link href="/explore" className="text-xs text-white/50 hover:text-white transition-colors">Explorar</Link>
                <Link href="/search" className="text-xs text-white/50 hover:text-white transition-colors">Buscar</Link>
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <Link href="/search" className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-lg">
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
        <section className="px-4 pt-7 pb-5 border-b border-[#1a1a1a]/50 max-w-7xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#bf9b4e]/70 mb-2">
            {settings?.siteTagline || 'Catálogo Premium'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.08] font-medium text-white tracking-tight max-w-2xl">
            {settings?.heroTitle || 'Productos que importan'}
          </h1>
          <p className="mt-3 text-base text-white/45 leading-relaxed max-w-lg">
            {settings?.heroSubtitle || 'Selección curada de tecnología, audio, accesorios y moda. Calidad sobre cantidad.'}
          </p>
          <div className="flex items-center gap-5 mt-4">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <div className="flex items-center gap-1.5 text-xs text-white/35 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3cb371] inline-block" />
              Envío gratis
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/35 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bf9b4e] inline-block" />
              Curaduría experta
            </div>
            <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>
        </section>

        <Suspense
          fallback={
            <div className="px-4 pt-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-[#0d0d0d] animate-pulse" />
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
