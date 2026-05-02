'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Package, Plus, Pencil, Eye, Search, X, Star,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { formatARS, discountPercent } from '@/lib/format'
import { DeleteProductButton } from '@/app/admin/DeleteProductButton'
import { TableRowSkeleton } from '@/components/Skeleton'

interface Category { id: string; name: string; parentId: string | null }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: 'status-available text-[9px] px-2 py-0.5 rounded-sm font-bold tracking-wide uppercase',
    PREORDER: 'status-preorder text-[9px] px-2 py-0.5 rounded-sm font-bold tracking-wide uppercase',
    OUT_OF_STOCK: 'status-oos text-[9px] px-2 py-0.5 rounded-sm font-bold tracking-wide uppercase',
  }
  const labels: Record<string, string> = {
    AVAILABLE: 'DISPONIBLE',
    PREORDER: 'POR ENCARGO',
    OUT_OF_STOCK: 'AGOTADO',
  }
  return (
    <span className={`inline-flex items-center ${styles[status] || styles.AVAILABLE}`}>
      {labels[status] || status}
    </span>
  )
}

function getProductThumbnail(product: any): string | null {
  try {
    if (product.images) {
      const imgs = JSON.parse(product.images)
      if (Array.isArray(imgs) && imgs[0]) return imgs[0]
    }
  } catch {}
  return product.imageUrl || product.imagePath || null
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'AVAILABLE', label: 'Disponibles' },
  { value: 'PREORDER', label: 'Encargos' },
  { value: 'OUT_OF_STOCK', label: 'Agotados' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más nuevos' },
  { value: 'oldest', label: 'Más viejos' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name', label: 'Nombre A-Z' },
]

export function ProductList({ initialCategories }: { initialCategories: Category[] }) {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [categories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')

  const perPage = 12

  const fetchProducts = useCallback(async (pg: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(perPage),
        ...(status !== 'all' && { status }),
        ...(sort && sort !== 'newest' && { sort }),
        ...(search && { q: search }),
        ...(category !== 'all' && { category }),
      })
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setPages(data.pages || 1)
    } catch {} finally {
      setLoading(false)
    }
  }, [status, sort, search, category])

  useEffect(() => { fetchProducts(1) }, [fetchProducts])

  useEffect(() => {
    if (search !== searchParams.get('q')) {
      const timer = setTimeout(() => fetchProducts(1), 350)
      return () => clearTimeout(timer)
    }
  }, [search]) // eslint-disable-line

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[--text] tracking-tight">Productos</h2>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[--text-tertiary] mt-1">{total} productos en catálogo</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-11 sm:h-10 px-5 rounded-xl bg-[--accent] text-[--bg] text-[12px] sm:text-[11px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-[16px] h-[16px] sm:w-[15px] sm:h-[15px]" strokeWidth={2} /> Nuevo Producto
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {/* Search */}
        <div className="w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-tertiary] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-[--bg-surface] border border-[--border] rounded-xl h-10 pl-10 pr-4 text-[13px] font-medium text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent]/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-[--text-tertiary] hover:text-[--text] hover:bg-[--bg-elevated] transition-colors duration-200">
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          {/* Status filter */}
          <div className="flex items-center bg-[--bg-surface] border border-[--border] rounded-xl p-1 h-10 flex-shrink-0">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setStatus(opt.value); setPage(1); fetchProducts(1) }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                  status === opt.value
                    ? 'bg-[--bg-elevated] text-[--text] shadow-sm'
                    : 'text-[--text-tertiary] hover:text-[--text-secondary]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); fetchProducts(1) }}
            className="bg-[--bg-surface] border border-[--border] rounded-xl h-10 px-3 text-[11px] font-semibold tracking-wide text-[--text-secondary] focus:outline-none focus:border-[--accent] transition-all cursor-pointer appearance-none flex-shrink-0"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); fetchProducts(1) }}
            className="bg-[--bg-surface] border border-[--border] rounded-xl h-10 px-3 text-[11px] font-semibold tracking-wide text-[--text-secondary] focus:outline-none focus:border-[--accent] transition-all cursor-pointer appearance-none flex-shrink-0"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[--bg-surface] border border-[--border] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[--border]">
            {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[--bg-elevated] flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-[--text-tertiary]" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-semibold text-[--text] mb-1">
              {search ? 'Sin resultados' : 'Sin productos'}
            </p>
            <p className="text-[12px] text-[--text-tertiary] mb-6">
              {search ? `No hay coincidencias para "${search}"` : 'Empezá a agregar productos al catálogo.'}
            </p>
            {!search && (
              <Link href="/admin/products/new" className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-[--accent-soft] text-[--accent] text-[11px] font-bold tracking-wide hover:opacity-80 transition-all duration-200">
                <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Crear producto
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[--border] hidden sm:table-row">
                    <th className="text-left px-4 sm:px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[--text-tertiary]">Producto</th>
                    <th className="text-left px-4 sm:px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[--text-tertiary] hidden md:table-cell">Categoría</th>
                    <th className="text-left px-4 sm:px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[--text-tertiary]">Precio</th>
                    <th className="text-left px-4 sm:px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[--text-tertiary] hidden sm:table-cell">Estado</th>
                    <th className="text-right px-4 sm:px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[--text-tertiary]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {products.map(product => {
                    const thumb = getProductThumbnail(product)
                    const hasDiscount = product.discountPrice && product.discountPrice > 0
                    return (
                      <tr key={product.id} className="hover:bg-[--bg-elevated] transition-colors group flex flex-col sm:table-row">
                        {/* Mobile & Desktop Main Info */}
                        <td className="px-4 sm:px-5 py-4 sm:py-3 flex flex-col sm:table-cell gap-3">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-16 h-16 sm:w-11 sm:h-11 rounded-lg bg-[--bg-elevated] overflow-hidden flex-shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 sm:w-4 sm:h-4 text-[--text-tertiary]" strokeWidth={1} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between sm:justify-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1 sm:mb-0">
                                    <span className="font-display font-semibold text-[14px] sm:text-[13px] text-[--text] line-clamp-2 sm:truncate sm:max-w-[220px] leading-tight">{product.name}</span>
                                    {product.featured && <Star className="w-3.5 h-3.5 text-[--accent] fill-[--accent] flex-shrink-0" strokeWidth={1} />}
                                  </div>
                                  <div className="sm:hidden flex items-center gap-2 mb-2">
                                    <span className="font-display font-bold text-[14px] text-[--accent] tabular-nums">{formatARS(product.price)}</span>
                                    {hasDiscount && (
                                      <span className="text-[11px] text-[--text-tertiary] line-through tabular-nums">{formatARS(product.discountPrice)}</span>
                                    )}
                                  </div>
                                  <div className="sm:hidden">
                                    <StatusBadge status={product.status} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile Actions - only visible on small screens */}
                          <div className="sm:hidden flex items-center gap-2 pt-3 mt-1 border-t border-[--border-mid]">
                            <Link href={`/product/${product.id}`} target="_blank" className="flex-1 flex justify-center items-center gap-2 h-9 rounded-lg bg-[--bg-surface] border border-[--border] text-[11px] font-bold text-[--text-secondary] hover:text-[--text] active:bg-[--bg-elevated]">
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`} className="flex-1 flex justify-center items-center gap-2 h-9 rounded-lg bg-[--bg-surface] border border-[--border] text-[11px] font-bold text-[--text-secondary] hover:text-[--text] active:bg-[--bg-elevated]">
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </Link>
                            <div className="w-9 h-9 flex-shrink-0">
                              <DeleteProductButton id={product.id} name={product.name} onDelete={() => fetchProducts(page)} />
                            </div>
                          </div>
                        </td>

                        {/* Desktop Only Columns */}
                        <td className="px-4 sm:px-5 py-3 hidden md:table-cell">
                          <span className="text-[11px] font-medium text-[--text-secondary]">{product.category?.name || product.categoryName || '—'}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 hidden sm:table-cell">
                          <div>
                            <span className="font-display font-semibold text-[13px] text-[--accent] tabular-nums">{formatARS(product.price)}</span>
                            {hasDiscount && (
                              <span className="block text-[11px] text-[--text-tertiary] line-through mt-0.5 tabular-nums">{formatARS(product.discountPrice)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 hidden sm:table-cell">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="p-2 rounded-xl text-[--text-tertiary] hover:text-[--text] hover:bg-[--bg-surface] transition-all duration-200"
                              title="Ver en tienda"
                            >
                              <Eye className="w-[15px] h-[15px]" strokeWidth={1.75} />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 rounded-xl text-[--text-tertiary] hover:text-[--text] hover:bg-[--bg-surface] transition-all duration-200"
                              title="Editar"
                            >
                              <Pencil className="w-[15px] h-[15px]" strokeWidth={1.75} />
                            </Link>
                            <DeleteProductButton id={product.id} name={product.name} onDelete={() => fetchProducts(page)} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-[--border]">
                <span className="text-[11px] font-medium text-[--text-tertiary]">
                  Página {page} de {pages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchProducts(p) }}
                    disabled={page <= 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[--bg] border border-[--border] text-[--text-secondary] hover:text-[--text] hover:border-[--border-mid] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, pages - 4)) + i
                      if (p < 1 || p > pages) return null
                      return (
                        <button
                          key={p}
                          onClick={() => { setPage(p); fetchProducts(p) }}
                          className={`w-8 h-8 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                            p === page
                              ? 'bg-[--accent] text-[oklch(9%_0.006_75)]'
                              : 'bg-[--bg] border border-[--border] text-[--text-secondary] hover:text-[--text] hover:border-[--border-mid]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => { const p = Math.min(pages, page + 1); setPage(p); fetchProducts(p) }}
                    disabled={page >= pages}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[--bg] border border-[--border] text-[--text-secondary] hover:text-[--text] hover:border-[--border-mid] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}