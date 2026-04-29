import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { CatalogClient } from './CatalogClient'
import { Search } from 'lucide-react'

export default async function Home() {
  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { order: 'asc' },
      include: { children: true }
    }),
    prisma.siteSettings.findFirst()
  ])

  return (
    <div className="min-h-screen bg-[#060606] selection:bg-[#bf9b4e]/20 sm:pb-0 pb-14">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass border-b border-[#1a1a1a]">
          <div className="flex justify-between items-center h-11 px-4">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-sm font-medium tracking-tight text-white">
                {settings?.siteName || 'Aura'}
              </span>
              <span className="ml-1.5 text-[9px] font-medium uppercase tracking-[0.25em] text-white/25">
                {settings?.siteTagline}
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/search" className="p-1.5 text-white/40 hover:text-white/80 transition-colors">
                <Search className="w-4.5 h-4.5" />
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="h-11" />

      <main className="pb-8">
        {/* Hero — Five-Second Filter: what, who, why */}
        <section className="px-4 pt-6 pb-4 border-b border-[#1a1a1a]/50">
          <h1 className="font-serif text-[26px] leading-[1.1] font-medium text-white tracking-tight">
            {settings?.heroTitle || 'Productos que importan'}
          </h1>
          <p className="mt-2.5 text-[13px] text-white/45 leading-relaxed max-w-sm">
            {settings?.heroSubtitle || 'Selección curada de tecnología, audio, accesorios y moda. Calidad sobre cantidad.'}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="h-px flex-1 bg-[#1a1a1a]" />
            <div className="flex items-center gap-2 text-[11px] text-white/35 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3cb371]" />
              Envío gratis
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/35 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bf9b4e]" />
              Curaduría experta
            </div>
          </div>
        </section>

        <CatalogClient products={products} categories={categories} />
      </main>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  )
}
