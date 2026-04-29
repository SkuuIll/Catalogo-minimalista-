import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { formatARS, discountPercent } from '@/lib/format'
import { LogoutButton } from './LogoutButton'
import { DeleteProductButton } from './DeleteProductButton'
import { FiltersBar } from '@/components/admin/FiltersBar'
import {
  Package, FolderOpen, Star, Plus, Settings, Pencil, AlertTriangle,
  TrendingUp, Eye, TrendingDown, DollarSign, Search, BarChart2, Tag
} from 'lucide-react'

// Helper to get the best available thumbnail from any image storage format
function getProductThumbnail(product: any): string | null {
  try {
    if (product.images) {
      const imgs = JSON.parse(product.images)
      if (Array.isArray(imgs) && imgs[0]) return imgs[0]
    }
  } catch {}
  return product.imageUrl || product.imagePath || null
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; sort?: string; page?: string; q?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  const categoryFilter = params.category || 'all'
  const sortBy = params.sort || 'newest'
  const currentPage = parseInt(params.page || '1')
  const searchQuery = params.q || ''
  const perPage = 15

  const categories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { order: 'asc' },
    include: { children: true }
  })

  const where: any = {}
  if (statusFilter !== 'all') where.status = statusFilter
  if (categoryFilter !== 'all') where.categoryId = categoryFilter
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ]
  }

  const orderBy: any = {}
  switch (sortBy) {
    case 'oldest': orderBy.createdAt = 'asc'; break
    case 'price-asc': orderBy.price = 'asc'; break
    case 'price-desc': orderBy.price = 'desc'; break
    case 'name': orderBy.name = 'asc'; break
    default: orderBy.createdAt = 'desc'
  }

  const [products, totalCount, allCategories] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      include: { category: true },
      skip: (currentPage - 1) * perPage,
      take: perPage
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: 'asc' } })
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  const [stats, outOfStock, preorder, onSale, featured] = await Promise.all([
    prisma.product.aggregate({ _count: true, _sum: { price: true } }),
    prisma.product.count({ where: { status: 'OUT_OF_STOCK' } }),
    prisma.product.count({ where: { status: 'PREORDER' } }),
    prisma.product.count({ where: { discountPrice: { not: null } } }),
    prisma.product.count({ where: { featured: true } }),
  ])

  const buildUrl = (extra: Record<string, string>) => {
    const base = new URLSearchParams()
    if (statusFilter !== 'all') base.set('status', statusFilter)
    if (categoryFilter !== 'all') base.set('category', categoryFilter)
    if (sortBy !== 'newest') base.set('sort', sortBy)
    if (searchQuery) base.set('q', searchQuery)
    Object.entries(extra).forEach(([k, v]) => v ? base.set(k, v) : base.delete(k))
    const s = base.toString()
    return `/admin${s ? '?' + s : ''}`
  }

  return (
    <div className="min-h-screen bg-[#060606]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex justify-between items-center h-12 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#bf9b4e]/10 border border-[#bf9b4e]/20 flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5 text-[#bf9b4e]" />
            </div>
            <span className="font-serif text-sm font-medium text-white">Admin</span>
            <span className="hidden sm:inline text-[11px] text-white/25 font-medium">· Panel de administración</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#111] border border-[#1a1a1a] text-[11px] text-white/40 hover:text-white/70 hover:border-white/10 transition-all">
              <Eye className="w-3 h-3" /> Ver tienda
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-7xl mx-auto py-5 px-4 sm:px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard value={stats._count} label="Total productos" icon={<Package className="w-4 h-4" />} color="white" />
          <StatCard value={formatARS(stats._sum?.price || 0)} label="Valor inventario" icon={<DollarSign className="w-4 h-4" />} isText color="gold" />
          <StatCard value={featured} label="Destacados" icon={<Star className="w-4 h-4" />} color="gold" />
          <StatCard value={allCategories.length} label="Categorías" icon={<FolderOpen className="w-4 h-4" />} color="white" />
        </div>

        {/* Status alerts */}
        {(outOfStock > 0 || preorder > 0 || onSale > 0) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {outOfStock > 0 && (
              <Link href={buildUrl({ status: 'OUT_OF_STOCK', page: '' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e05555]/5 border border-[#e05555]/15 hover:bg-[#e05555]/10 transition-colors">
                <AlertTriangle className="w-3 h-3 text-[#e05555]" />
                <span className="text-xs font-medium text-[#e05555]">{outOfStock} sin stock</span>
              </Link>
            )}
            {preorder > 0 && (
              <Link href={buildUrl({ status: 'PREORDER', page: '' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4a030]/5 border border-[#d4a030]/15 hover:bg-[#d4a030]/10 transition-colors">
                <TrendingUp className="w-3 h-3 text-[#d4a030]" />
                <span className="text-xs font-medium text-[#d4a030]">{preorder} por pedido</span>
              </Link>
            )}
            {onSale > 0 && (
              <Link href={buildUrl({ status: '', page: '' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3cb371]/5 border border-[#3cb371]/15 hover:bg-[#3cb371]/10 transition-colors">
                <Tag className="w-3 h-3 text-[#3cb371]" />
                <span className="text-xs font-medium text-[#3cb371]">{onSale} en oferta</span>
              </Link>
            )}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all">
            <Plus className="w-3.5 h-3.5" /> Nuevo producto
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#111] border border-[#1a1a1a] text-xs text-white/50 hover:text-white hover:border-white/10 transition-all">
            <FolderOpen className="w-3.5 h-3.5" /> Categorías
          </Link>
          <Link href="/admin/settings" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#111] border border-[#1a1a1a] text-xs text-white/50 hover:text-white hover:border-white/10 transition-all">
            <Settings className="w-3.5 h-3.5" /> Configuración
          </Link>

          {/* Search bar */}
          <form className="ml-auto flex-1 min-w-[160px] max-w-xs relative" method="get" action="/admin">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Buscar producto..."
              className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-9 pl-9 pr-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/15 transition-all"
            />
            {/* preserve other params */}
            {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
            {categoryFilter !== 'all' && <input type="hidden" name="category" value={categoryFilter} />}
            {sortBy !== 'newest' && <input type="hidden" name="sort" value={sortBy} />}
          </form>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-10 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] mb-3 animate-pulse" />}>
          <FiltersBar categories={allCategories} />
        </Suspense>

        {/* Products table */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              {searchQuery ? `Resultados para "${searchQuery}"` : statusFilter !== 'all' ? `Filtrado: ${statusFilter}` : 'Todos los productos'}
            </span>
            <span className="text-[11px] text-white/25">{totalCount} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-[#1a1a1a]/60">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Producto</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30 hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Precio</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Estado</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]/40">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
                        <Package className="w-5 h-5 text-white/10" />
                      </div>
                      <p className="text-white/40 text-sm font-medium mb-1">
                        {searchQuery ? 'Sin resultados' : 'Sin productos'}
                      </p>
                      <p className="text-white/25 text-xs">
                        {searchQuery ? `No hay productos que coincidan con "${searchQuery}"` : 'Empezá creando tu primer producto'}
                      </p>
                      {!searchQuery && (
                        <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 mt-4 h-8 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all">
                          <Plus className="w-3 h-3" /> Crear producto
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  products.map(product => {
                    const thumb = getProductThumbnail(product)
                    return (
                      <tr key={product.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#111] border border-[#1a1a1a] overflow-hidden flex-shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-3.5 h-3.5 text-white/10" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-white truncate max-w-[180px] sm:max-w-[240px]">{product.name}</span>
                                {product.featured && <Star className="w-3 h-3 text-[#bf9b4e] fill-[#bf9b4e] flex-shrink-0" />}
                              </div>
                              {product.discountPrice && (
                                <span className="text-[10px] font-bold text-[#e05555]">-{discountPercent(product.price, product.discountPrice)}% oferta</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-white/35">{product.category?.name || product.categoryName || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-semibold text-[#bf9b4e]">{formatARS(product.price)}</span>
                            {product.discountPrice && (
                              <div className="text-[10px] text-white/25 line-through">{formatARS(product.discountPrice)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                              title="Ver en tienda"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-1.5 rounded-lg text-white/20 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <DeleteProductButton id={product.id} name={product.name} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a]">
              <span className="text-xs text-white/25">
                Página {currentPage} / {totalPages} · {totalCount} productos
              </span>
              <div className="flex gap-1">
                {currentPage > 1 && (
                  <Link
                    href={buildUrl({ page: String(currentPage - 1) })}
                    className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1a1a1a] text-xs text-white/50 hover:text-white hover:border-white/10 transition-all"
                  >
                    Anterior
                  </Link>
                )}
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
                  if (page < 1 || page > totalPages) return null
                  return (
                    <Link
                      key={page}
                      href={buildUrl({ page: String(page) })}
                      className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all ${
                        page === currentPage
                          ? 'bg-white text-black font-semibold'
                          : 'bg-[#111] border border-[#1a1a1a] text-white/40 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {page}
                    </Link>
                  )
                })}
                {currentPage < totalPages && (
                  <Link
                    href={buildUrl({ page: String(currentPage + 1) })}
                    className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1a1a1a] text-xs text-white/50 hover:text-white hover:border-white/10 transition-all"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary footer */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MiniStat value={products.filter(p => p.status === 'AVAILABLE').length} label="Disponibles" color="#3cb371" />
          <MiniStat value={preorder} label="Por pedido" color="#d4a030" />
          <MiniStat value={outOfStock} label="Sin stock" color="#e05555" />
          <MiniStat value={onSale} label="En oferta" color="#bf9b4e" />
        </div>
      </main>
    </div>
  )
}

function StatCard({
  value, label, icon, isText, color,
}: {
  value: number | string; label: string; icon: React.ReactNode; isText?: boolean; color: 'white' | 'gold'
}) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">{label}</span>
        <div className="text-white/20">{icon}</div>
      </div>
      <div className={`font-bold tracking-tight ${isText ? 'text-base' : 'text-2xl'} ${color === 'gold' ? 'text-[#bf9b4e]' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

function MiniStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-3 py-2.5 flex items-center justify-between">
      <span className="text-xs text-white/30">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    AVAILABLE: 'text-[#3cb371] bg-[#3cb371]/8 border-[#3cb371]/15',
    PREORDER: 'text-[#d4a030] bg-[#d4a030]/8 border-[#d4a030]/15',
    OUT_OF_STOCK: 'text-[#e05555] bg-[#e05555]/8 border-[#e05555]/15',
  }
  const labels = { AVAILABLE: 'Disponible', PREORDER: 'Pedido', OUT_OF_STOCK: 'Agotado' }
  const s = status as keyof typeof styles
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${styles[s] || styles.AVAILABLE}`}>
      {labels[s] || status}
    </span>
  )
}
