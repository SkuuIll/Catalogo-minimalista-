import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from './LogoutButton'
import { DeleteProductButton } from './DeleteProductButton'

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
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-between items-center h-16">
            <h1 className="font-serif text-xl font-medium text-primary">Panel de Control</h1>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link href="/" className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
                Ver Tienda
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <StatCard label="Productos" value={products.length} icon="📦" />
          <StatCard label="Categorías" value={categories.length} icon="🏷️" />
          <StatCard label="Destacados" value={products.filter(p => p.featured).length} icon="⭐" />
          <StatCard label="Vistas" value="—" icon="👁️" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8 sm:mb-10">
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide hover:-translate-y-0.5 transition-transform">
            <span>+</span> Nuevo Producto
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center gap-2 glass-strong border border-white/5 text-on-surface px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide hover:border-white/10 transition-colors">
            <span>🏷️</span> Categorías
          </Link>
          <Link href="/admin/settings" className="inline-flex items-center gap-2 glass-strong border border-white/5 text-on-surface px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide hover:border-white/10 transition-colors">
            <span>⚙️</span> Configuración
          </Link>
        </div>

        {/* Products List */}
        <div className="mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-on-surface">Productos</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{products.length} productos registrados</p>
        </div>

        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-white/5">
            {products.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">No hay productos.</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-14 w-14 bg-surface-container rounded-lg border border-white/5 overflow-hidden">
                      {(product.imagePath || product.imageUrl) ? (
                        <img src={(product.imagePath || product.imageUrl) || ''} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full bg-surface-container" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-base text-on-surface truncate">{product.name}</div>
                      <div className="text-xs text-on-surface-variant">
                        {product.category?.icon} {product.category?.name || product.categoryName || 'Sin categoría'} · <span className="text-primary">${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DeleteProductButton id={product.id} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <ul className="hidden sm:block divide-y divide-white/5">
            {products.length === 0 ? (
              <li className="p-12 text-center text-on-surface-variant">No hay productos en el registro.</li>
            ) : (
              products.map((product) => (
                <li key={product.id} className="hover:bg-surface-bright/20 transition-colors">
                  <div className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0 h-14 w-14 bg-surface-container rounded-lg border border-white/5 overflow-hidden">
                        {(product.imagePath || product.imageUrl) ? (
                        <img src={(product.imagePath || product.imageUrl) || ''} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="h-full w-full bg-surface-container" />
                        )}
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="font-serif text-base text-on-surface mb-0.5 truncate">{product.name}</div>
                        <div className="text-sm text-on-surface-variant">
                          {product.category?.icon} {product.category?.name || product.categoryName || 'Sin categoría'} <span className="mx-2 opacity-50">•</span> <span className="text-primary">${product.price.toFixed(2)}</span>
                          {product.featured && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Destacado</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <DeleteProductButton id={product.id} />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="glass p-4 rounded-xl border border-white/5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xl sm:text-2xl font-semibold text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant mt-1">{label}</div>
    </div>
  )
}
