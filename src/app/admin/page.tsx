import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from './LogoutButton'
import { DeleteProductButton } from './DeleteProductButton'

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <h1 className="font-serif text-xl sm:text-2xl font-medium text-primary">Panel de Control</h1>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
                Ver Tienda
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <h2 className="font-serif text-2xl sm:text-[32px] font-medium leading-[1.2] text-on-surface">Registro de Productos</h2>
            <p className="mt-2 text-sm sm:text-base text-on-surface-variant">Gestionando {products.length} productos activos.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-block bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold tracking-[0.05em] hover:-translate-y-0.5 transition-transform whitespace-nowrap"
          >
            + Nuevo Producto
          </Link>
        </div>

        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          {/* Versión móvil: tarjetas */}
          <div className="sm:hidden divide-y divide-white/5">
            {products.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                No hay productos en el registro.
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-14 w-14 bg-surface-container rounded-lg border border-white/5 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full bg-surface-container" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-base text-on-surface truncate">{product.name}</div>
                      <div className="text-xs text-on-surface-variant font-sans">
                        {product.category || 'Sin categoría'} · <span className="text-primary">${product.price.toFixed(2)}</span>
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

          {/* Versión desktop: lista */}
          <ul className="hidden sm:block divide-y divide-white/5">
            {products.length === 0 ? (
              <li className="p-12 text-center text-on-surface-variant">No hay productos en el registro.</li>
            ) : (
              products.map((product) => (
                <li key={product.id} className="hover:bg-surface-bright/20 transition-colors">
                  <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 bg-surface-container rounded-lg border border-white/5 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="h-full w-full bg-surface-container" />
                        )}
                      </div>
                      <div className="ml-4 sm:ml-6 min-w-0">
                        <div className="font-serif text-base sm:text-lg text-on-surface mb-1 truncate">{product.name}</div>
                        <div className="text-sm text-on-surface-variant font-sans">
                          {product.category || 'Sin categoría'} <span className="mx-2 opacity-50">•</span> <span className="text-primary">${product.price.toFixed(2)}</span>
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
