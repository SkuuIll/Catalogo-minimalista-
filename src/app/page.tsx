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
        {/* Hero */}
        <section className="px-4 pt-6 pb-2">
          <h1 className="font-serif text-2xl leading-[1.15] font-medium text-white tracking-tight">
            {settings?.heroTitle || 'Curaduría esencial'}
          </h1>
          <p className="mt-2 text-[13px] text-white/40 leading-relaxed max-w-md">
            {settings?.heroSubtitle}
          </p>
        </section>

        <CatalogClient products={products} categories={categories} />
      </main>

      <BottomNav />
      <PWAInstallPrompt />
    </div>
  )
}
