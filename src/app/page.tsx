import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import { BottomNav } from '@/components/BottomNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { CatalogClient } from './CatalogClient'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import {
  Search, ArrowRight, Sparkles, Truck, Shield, RefreshCw, Headphones, Zap
} from 'lucide-react'
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

  const siteName = settings?.siteName || 'SHOWROOM JR'
  const tagline = settings?.siteTagline || 'Catálogo Premium'
  const heroTitle = settings?.heroTitle || 'Todo lo que buscás.'
  const heroSub = settings?.heroSubtitle || 'Tecnología, moda y accesorios — en un solo lugar.'

  return (
    <div className="flex flex-col min-h-full pb-16 md:pb-0">

      {/* ── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 nav-glass border-b border-[--border]">
        <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-8 container-desktop mx-auto">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center shadow-sm shrink-0">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#E5B567] fill-[#E5B567]" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0">
              <span className="font-display font-bold text-[15px] md:text-[16px] tracking-tight text-[--text] leading-none">
                {siteName}
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-[--text-tertiary] leading-none mt-0.5">
                {tagline}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 bg-[--bg-elevated] rounded-full p-1 border border-[--border]">
            <Link href="/" className="px-4 py-2 text-[12px] font-semibold text-[--text] bg-[--bg-surface] rounded-full shadow-sm transition-all duration-200">
              Inicio
            </Link>
            <Link href="/explore" className="px-4 py-2 text-[12px] font-medium text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-surface]/60 rounded-full transition-all duration-200">
              Categorías
            </Link>
            <Link href="/search" className="px-4 py-2 text-[12px] font-medium text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-surface]/60 rounded-full transition-all duration-200">
              Buscar
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Buscar"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1e1e1e] text-[--text-secondary] hover:text-white border border-[#333] hover:border-[#E5B567]/50 transition-all duration-200"
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
        {/* ── Hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[--bg] min-h-[88vh] md:min-h-[78vh] flex flex-col justify-center">
          {/* Background grid — golden tinted, visible */}
          <div className="absolute inset-0 hero-grid" />

          {/* Large ambient glow — center top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[--accent]/20 via-[--accent]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
          {/* Corner accents */}
          <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[oklch(65%_0.18_260)/0.12] to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[300px] bg-gradient-to-tr from-[oklch(60%_0.18_38)/0.10] to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 px-4 md:px-8 py-16 md:py-24 container-desktop mx-auto w-full">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[--accent-soft] border border-[--accent]/30 mb-8 animate-fade-up shadow-sm shadow-[--accent-glow]">
                <div className="w-2 h-2 rounded-full bg-[--accent] animate-pulse" />
                <Sparkles className="w-3 h-3 text-[--accent]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[--accent]">
                  {tagline}
                </span>
              </div>

              {/* Headline — massive */}
              <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[0.96] animate-fade-up delay-1 text-[clamp(44px,9vw,88px)] text-balance mb-6">
                <span className="gradient-text">{heroTitle.split(' ')[0]}</span>
                {heroTitle.split(' ').length > 1 && (
                  <span className="text-[--text]"> {heroTitle.split(' ').slice(1).join(' ')}</span>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-[15px] md:text-[18px] text-[--text-secondary] leading-relaxed max-w-[520px] animate-fade-up delay-2 text-balance">
                {heroSub}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-row items-center justify-center gap-3 md:gap-4 mt-10 animate-fade-up delay-3 w-full max-w-sm sm:max-w-none">
                <Link
                  href="/explore"
                  className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 h-12 md:h-14 px-4 md:px-8 rounded-full bg-[#E5B567] text-[#111] text-[13px] md:text-[14px] font-bold tracking-wide hover:opacity-90 active:scale-[0.97] transition-all duration-200 press"
                >
                  Explorar catálogo
                </Link>
                <Link
                  href="/search"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 h-12 md:h-14 px-4 md:px-8 rounded-full border border-[--border-mid] bg-transparent text-[--text] text-[13px] md:text-[14px] font-bold hover:border-[#E5B567]/50 active:scale-[0.97] transition-all duration-200 press"
                >
                  Buscar productos
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-8 md:gap-12 mt-14 animate-fade-up delay-4">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[20px] md:text-[24px] font-bold text-[--text] leading-none tabular-nums">{products.length}</span>
                  <span className="text-[13px] font-medium text-[--text-secondary] mt-2">productos</span>
                </div>
                <div className="w-px h-10 bg-[#333]" />
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[20px] md:text-[24px] font-bold text-[--text] leading-none tabular-nums">{categories.length}</span>
                  <span className="text-[13px] font-medium text-[--text-secondary] mt-2">categorías</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust badges ─────────────────────────── */}
        <section className="px-4 md:px-8 py-6 border-y border-[#333] bg-[#111]">
          <div className="container-desktop mx-auto">
            <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
              {[
                { icon: Truck, label: 'Envio', color: 'text-[#A47CDB]' },
                { icon: Shield, label: 'Garantía', color: 'text-[#85C86D]' },
                { icon: RefreshCw, label: 'Devoluciones', color: 'text-[#D08B5B]' },
                { icon: Headphones, label: 'Soporte', color: 'text-[#64A496]' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 group shrink-0">
                  <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
                  <span className="text-[14px] font-medium text-[--text-secondary] group-hover:text-[--text] transition-colors">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Catalog ──────────────────────────────── */}
        <Suspense
          fallback={
            <div className="px-4 md:px-8 pt-8 container-desktop mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square skeleton rounded-2xl" />
                ))}
              </div>
            </div>
          }
        >
          <CatalogClient products={products} categories={categories} />
        </Suspense>

        {/* ── Footer ───────────────────────────────── */}
        <footer className="mt-auto border-t border-[--border] bg-[--bg-surface]">
          <div className="px-4 md:px-8 py-10 container-desktop mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

              {/* Brand column */}
              <div className="flex flex-col items-center md:items-start gap-3">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-[#E5B567] fill-[#E5B567]" strokeWidth={2} />
                  </div>
                  <span className="font-display font-bold text-[16px] tracking-tight text-[--text]">
                    {siteName}
                  </span>
                </Link>
                <p className="text-[11px] text-[--text-tertiary] text-center md:text-left max-w-[220px]">
                  {settings?.siteTagline || 'Catálogo Premium'}. Diseño moderno y experiencia premium.
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-6 md:gap-8">
                {[
                  { href: '/', label: 'Inicio' },
                  { href: '/explore', label: 'Categorías' },
                  { href: '/search', label: 'Buscar' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-[12px] font-medium text-[--text-secondary] hover:text-[--accent] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-5 border-t border-[--border] flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[10px] text-[--text-tertiary] tracking-wide">
                © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[--green]" />
                <span className="text-[10px] text-[--text-tertiary]">Online</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <BottomNav />
      <PWAInstallPrompt />
      <WhatsAppButton number={settings?.whatsappNumber || ''} message="Hola! Quisiera ver el catálogo." />
    </div>
  )
}
