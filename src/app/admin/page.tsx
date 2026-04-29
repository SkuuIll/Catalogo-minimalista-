import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from './LogoutButton'
import { DeleteProductButton } from './DeleteProductButton'
import {
  Package, Tag, Star, Eye, Plus, Settings, ChevronRight,
  LayoutDashboard, ShoppingBag, FolderOpen
} from 'lucide-react'

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <LayoutDashboard className="w-4 h-4 text-primary" />
              </div>
              <h1 className="font-serif text-base sm:text-lg font-medium text-on-surface">Panel de Control</h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/" className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary transition-colors">
                <Eye className="w-3 h-3" />
                Ver Tienda
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="h-14" />

      <main className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-16">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Productos"
            value={products.length}
            icon={<Package className="w-4 h-4" />}
            color="text-primary"
            bg="bg-primary/5"
            border="border-primary/10"
          />
          <StatCard
            label="Categorías"
            value={categories.length}
            icon={<FolderOpen className="w-4 h-4" />}
            color="text-blue-400"
            bg="bg-blue-400/5"
            border="border-blue-400/10"
          />
          <StatCard
            label="Destacados"
            value={products.filter(p => p.featured).length}
            icon={<Star className="w-4 h-4" />}
            color="text-amber-400"
            bg="bg-amber-400/5"
            border="border-amber-400/10"
          />
          <StatCard
            label="Total Valor"
            value={`$${products.reduce((a, p) => a + p.price, 0).toFixed(0)}`}
            icon={<ShoppingBag className="w-4 h-4" />}
            color="text-emerald-400"
            bg="bg-emerald-400/5"
            border="border-emerald-400/10"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <ActionButton href="/admin/products/new" icon={<Plus className="w-3.5 h-3.5" />} primary>
            Nuevo Producto
          </ActionButton>
          <ActionButton href="/admin/categories" icon={<Tag className="w-3.5 h-3.5" />}>
            Categorías
          </ActionButton>
          <ActionButton href="/admin/settings" icon={<Settings className="w-3.5 h-3.5" />}>
            Configuración
          </ActionButton>
        </div>

        {/* Products */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-medium text-on-surface">Productos</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant/60">{products.length} productos registrados</p>
          </div>
        </div>

        <div className="glass rounded-xl sm:rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-white/[0.04]">
            {products.length === 0 ? (
              <EmptyState />
            ) : (
              products.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-14 w-14 bg-surface-container rounded-xl border border-white/[0.04] overflow-hidden">
                      {(product.imagePath || product.imageUrl) ? (
                        <img src={(product.imagePath || product.imageUrl) || ''} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-surface-container">
                          <Package className="w-5 h-5 text-on-surface-variant/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-on-surface truncate">{product.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-on-surface-variant/60">
                          {product.category?.name || product.categoryName || 'Sin categoría'}
                        </span>
                        <span className="text-[11px] text-primary font-semibold">${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <DeleteProductButton id={product.id} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04] text-left text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Precio</th>
                  <th className="px-5 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4}><EmptyState /></td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex-shrink-0 h-11 w-11 bg-surface-container rounded-lg border border-white/[0.04] overflow-hidden">
                            {(product.imagePath || product.imageUrl) ? (
                              <img src={(product.imagePath || product.imageUrl) || ''} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-surface-container">
                                <Package className="w-4 h-4 text-on-surface-variant/30" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-on-surface truncate">{product.name}</div>
                            {product.featured && (
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                <Star className="w-2.5 h-2.5" />
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-on-surface-variant/60">
                          {product.category?.name || product.categoryName || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <DeleteProductButton id={product.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon, color, bg, border }: { label: string; value: number | string; icon: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <div className={`${bg} ${border} border p-4 rounded-xl sm:rounded-2xl`}>
      <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">{value}</div>
      <div className="text-[11px] text-on-surface-variant/50 mt-0.5">{label}</div>
    </div>
  )
}

function ActionButton({ href, icon, children, primary }: { href: string; icon: React.ReactNode; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all
        ${primary
          ? 'bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary hover:opacity-90 shadow-lg shadow-primary/10'
          : 'glass-strong border border-white/[0.06] text-on-surface hover:border-white/10 hover:bg-white/[0.02]'
        }
      `}
    >
      {icon}
      {children}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <Package className="w-10 h-10 text-on-surface-variant/20 mx-auto mb-3" />
      <p className="text-sm text-on-surface-variant/50">No hay productos registrados.</p>
      <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline">
        <Plus className="w-3 h-3" />
        Crear el primero
      </Link>
    </div>
  )
}
