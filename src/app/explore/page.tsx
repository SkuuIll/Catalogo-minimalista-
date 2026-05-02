import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatARS } from '@/lib/format'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { MobileMenu } from '@/components/MobileMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ImageFade } from '@/components/ImageFade'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Search, Package, ArrowRight, Compass, ChevronRight, Grid3X3, Zap, TrendingUp } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Explorá todas las categorías del catálogo. Tecnología, moda, accesorios y más.',
}

export default async function ExplorePage() {
  const [categories, products, settings] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: { children: true, _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
      take: 12,
    }),
    prisma.siteSettings.findFirst(),
  ])

  const siteName = settings?.siteName || 'SHOWROOM JR'
  const parentCategories = categories.filter(c => !c.parentId)

  // Gradient palette for category cards
  const catGradients = [
    'from-[oklch(72%_0.16_78)] to-[oklch(63%_0.18_42)]',
    'from-[oklch(65%_0.18_260)] to-[oklch(58%_0.20_280)]',
    'from-[oklch(60%_0.20_155)] to-[oklch(52%_0.18_170)]',
    'from-[oklch(68%_0.22_25)] to-[oklch(60%_0.20_10)]',
    'from-[oklch(70%_0.18_310)] to-[oklch(62%_0.20_330)]',
    'from-[oklch(72%_0.15_190)] to-[oklch(64%_0.17_210)]',
  ]

  return (
    <div className="flex flex-col min-h-full pb-16 md:pb-0">

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 nav-glass border-b border-[--border]">
        <div className="flex justify-between items-center h-14 md:h-16 px-4 md:px-8 container-desktop mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-[--border] transition-all duration-200">
              <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} />
            </Link>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[--accent]" strokeWidth={2} />
              <span className="font-display font-bold text-[15px] text-[--text] tracking-tight">
                Categorías
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/search"
              aria-label="Buscar"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] border border-transparent hover:border-[--border] transition-all duration-200"
            >
              <Search className="w-4 h-4" strokeWidth={1.75} />
            </Link>
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <main>

        {/* ── Page intro ────────────────────────── */}
        <section className="px-4 md:px-8 pt-8 pb-6 container-desktop mx-auto">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[--accent] to-[oklch(63%_0.18_42)]" />
            <h1 className="font-display font-extrabold text-[22px] md:text-[26px] text-[--text] tracking-tight">
              Explorá el catálogo
            </h1>
          </div>
          <p className="text-[13px] text-[--text-secondary] ml-[calc(4px+10px)] mt-1">
            {parentCategories.length} categorías · {products.length}+ productos disponibles
          </p>
        </section>

        {/* ── Category grid ────────────────────── */}
        <section className="px-4 md:px-8 pb-10 container-desktop mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {/* All products tile */}
            <ScrollReveal delay={0}>
              <Link
                href="/"
                className="group relative flex flex-col justify-between aspect-square bg-gradient-to-br from-[--accent] to-[oklch(63%_0.18_42)] rounded-3xl overflow-hidden shadow-lg shadow-[--accent-glow] press"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
                <div className="relative p-4 flex flex-col h-full justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[14px] text-white leading-tight">Todo el catálogo</h3>
                    <p className="text-[10px] text-white/70 mt-0.5 font-semibold">{products.length}+ productos</p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {parentCategories.map((cat, i) => {
              const gradient = catGradients[i % catGradients.length]
              const childCount = cat.children?.length || 0
              return (
                <ScrollReveal key={cat.id} delay={Math.min((i + 1) * 0.06, 0.4)}>
                  <Link
                    href={`/?category=${cat.id}`}
                    className="group relative flex flex-col aspect-square bg-[--bg-surface] border border-[--border] rounded-3xl overflow-hidden card-hover press"
                  >
                    {/* Gradient top strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-70`} />

                    <div className="p-4 flex flex-col h-full justify-between">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                        <Package className="w-5 h-5 text-white" strokeWidth={1.75} />
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-display font-bold text-[13px] md:text-[14px] text-[--text] leading-tight line-clamp-2 group-hover:text-[--accent] transition-colors duration-200">
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-semibold text-[--text-tertiary] tabular-nums">
                            {cat._count?.products || 0}
                          </span>
                          <span className="text-[10px] text-[--text-tertiary]">productos</span>
                          {childCount > 0 && (
                            <span className="ml-auto text-[9px] font-bold text-[--accent] bg-[--accent-soft] px-1.5 py-0.5 rounded-full">
                              {childCount} sub
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                      <div className="w-6 h-6 rounded-full bg-[--accent-soft] flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-[--accent]" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </section>

        {/* ── Divider ──────────────────────────── */}
        <div className="px-4 md:px-8 container-desktop mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-[--accent]/30 to-transparent" />
        </div>

        {/* ── Recent products ───────────────────── */}
        <section className="px-4 md:px-8 py-8 container-desktop mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[--accent]" strokeWidth={2} />
              <h2 className="font-display font-bold text-[16px] md:text-[18px] text-[--text] tracking-tight">
                Últimos agregados
              </h2>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1 text-[12px] font-semibold text-[--accent] hover:opacity-70 transition-opacity"
            >
              Ver todo
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {products.map((p, i) => {
              let imgs: string[] = []
              try { if (p.images) imgs = JSON.parse(p.images) } catch {}
              const img = imgs[0] || p.imagePath || p.imageUrl
              const hasDiscount = p.discountPrice && p.discountPrice > p.price
              const isOOS = p.status === 'OUT_OF_STOCK'
              return (
                <ScrollReveal key={p.id} delay={Math.min(i * 0.04, 0.25)}>
                  <Link href={`/product/${p.id}`} className="group flex flex-col gap-2 press">
                    <div className={`relative aspect-[3/4] overflow-hidden bg-[--bg-elevated] rounded-2xl border border-[--border] card-hover ${isOOS ? 'opacity-75' : ''}`}>
                      {img ? (
                        <ImageFade src={img} alt={p.name} containerClassName="w-full h-full" className="img-zoom" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-[--text-tertiary]" strokeWidth={1} />
                        </div>
                      )}
                      {isOOS && (
                        <div className="absolute inset-0 bg-[--bg]/60 flex items-center justify-center">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[--text-tertiary] bg-[--bg-surface]/80 px-2 py-0.5 rounded-full">Agotado</span>
                        </div>
                      )}
                      {hasDiscount && !isOOS && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-[--red] to-[oklch(53%_0.20_25)] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wide">
                          -{Math.round(((p.discountPrice! - p.price) / p.discountPrice!) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 px-0.5">
                      <h3 className="text-[12px] font-semibold text-[--text] leading-snug line-clamp-2 group-hover:text-[--accent] transition-colors duration-200">
                        {p.name}
                      </h3>
                      <span className="text-[13px] font-extrabold gradient-text tabular-nums">
                        {formatARS(p.price)}
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </section>

        {/* ── Footer ───────────────────────────── */}
        <footer className="border-t border-[--border] px-4 md:px-8 py-6 container-desktop mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[--accent] to-[oklch(63%_0.17_42)] flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-[13px] text-[--text]">{siteName}</span>
            </div>
            <p className="text-[10px] text-[--text-tertiary]">
              © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </main>

      <BottomNav />
      <PWAInstallPrompt />
      <WhatsAppButton number={settings?.whatsappNumber || ''} message="Hola! Estoy viendo las categorías del catálogo." />
    </div>
  )
}
