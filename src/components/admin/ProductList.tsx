'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Package, Plus, Pencil, Trash2, Eye, Search, X, Star,
  ChevronLeft, ChevronRight, Filter, ArrowUpDown
} from 'lucide-react'
import { formatARS, discountPercent } from '@/lib/format'
import { DeleteProductButton } from '@/app/admin/DeleteProductButton'
import { TableRowSkeleton } from '@/components/Skeleton'

interface Category { id: string; name: string; parentId: string | null }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: 'text-[#3cb371] bg-[#3cb371]/8 border-[#3cb371]/15',
    PREORDER: 'text-[#C9A55A] bg-[#C9A55A]/8 border-[#C9A55A]/15',
    OUT_OF_STOCK: 'text-[#C0392B] bg-[#C0392B]/8 border-[#C0392B]/15',
  }
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    PREORDER: 'Pedido',
    OUT_OF_STOCK: 'Agotado',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium border ${styles[status] || styles.AVAILABLE}`}>
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
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'PREORDER', label: 'Por pedido' },
  { value: 'OUT_OF_STOCK', label: 'Agotado' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más reciente' },
  { value: 'oldest', label: 'Más antiguo' },
  { value: 'price-asc', label: 'Precio ↑' },
  { value: 'price-desc', label: 'Precio ↓' },
  { value: 'name', label: 'Nombre A-Z' },
]

export function ProductList({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>(initialCategories)
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

  const buildUrl = (extra: Record<string, string>) => {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (sort !== 'newest') p.set('sort', sort)
    if (search) p.set('q', search)
    if (category !== 'all') p.set('category', category)
    Object.entries(extra).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    return `/admin?${p.toString()}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-light text-[#F0EAE0] tracking-[0.02em]">Productos</h2>
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] mt-0.5">{total} productos en total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[12px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-sm relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-transparent border-b border-[#3D3830] h-10 pl-10 pr-4 text-sm text-[#F0EAE0] placeholder-[#8A8278]/30 focus:outline-none focus:border-[#C9A55A] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 bg-[#221E1A] border border-[#2E2925] rounded-sm p-1">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1); fetchProducts(1) }}
              className={`px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-[0.12em] font-normal transition-all duration-300 ${
                status === opt.value
                  ? 'bg-[#C9A55A] text-[#1A1714]'
                  : 'text-[#8A8278] hover:text-[#F0EAE0]'
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
          className="bg-[#221E1A] border border-[#2E2925] rounded-sm h-10 px-3 text-sm text-[#8A8278] focus:outline-none focus:border-[#3D3830] transition-all cursor-pointer"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); fetchProducts(1) }}
          className="bg-[#221E1A] border border-[#2E2925] rounded-sm h-10 px-3 text-sm text-[#8A8278] focus:outline-none focus:border-[#3D3830] transition-all cursor-pointer"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#221E1A] border border-[#2E2925] rounded-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#2E2925]/40">
            {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-sm bg-[#2A2520] border border-[#2E2925] flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-[#F0EAE0]/10" />
            </div>
            <p className="text-base font-medium text-[#8A8278] mb-1">
              {search ? 'Sin resultados' : 'Sin productos'}
            </p>
            <p className="text-sm text-[#8A8278]/50 mb-5">
              {search ? `No hay productos para "${search}"` : 'Empezá creando tu primer producto'}
            </p>
            {!search && (
              <Link href="/admin/products/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] transition-all duration-300">
                <Plus className="w-3.5 h-3.5" /> Crear producto
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#2E2925]/60">
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]">Producto</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A8278] hidden md:table-cell">Categoría</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]">Precio</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]">Estado</th>
                    <th className="text-center px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]">Stock</th>
                    <th className="text-right px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A8278]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2925]/40">
                  {products.map(product => {
                    const thumb = getProductThumbnail(product)
                    const hasDiscount = product.discountPrice && product.discountPrice > 0
                    return (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-sm bg-[#2A2520] border border-[#2E2925] overflow-hidden flex-shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-[#F0EAE0]/10" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#F0EAE0]/90 truncate max-w-[200px]">{product.name}</span>
                                {product.featured && <Star className="w-3.5 h-3.5 text-[#C9A55A] fill-[#C9A55A] flex-shrink-0" />}
                              </div>
                              {hasDiscount && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[#C0392B]/10 text-[10px] font-bold text-[#C0392B] mt-1">
                                  -{discountPercent(product.price, product.discountPrice)}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-[#8A8278]">{product.category?.name || product.categoryName || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <span className="text-sm font-serif italic text-[#C9A55A]">{formatARS(product.price)}</span>
                            {hasDiscount && (
                              <span className="block text-[10px] text-[#8A8278]/40 line-through mt-0.5">{formatARS(product.discountPrice)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {product.status === 'OUT_OF_STOCK' ? (
                            <span className="text-xs text-[#C0392B]">0</span>
                          ) : product.status === 'PREORDER' ? (
                            <span className="text-xs text-[#C9A55A]">Por pedido</span>
                          ) : (
                            <span className="text-xs text-[#3cb371]">Disponible</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="p-2 rounded-sm text-[#8A8278] hover:text-[#F0EAE0] hover:bg-white/[0.04] transition-all duration-300"
                              title="Ver en tienda"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 rounded-sm text-[#8A8278] hover:text-[#F0EAE0] hover:bg-white/[0.04] transition-all duration-300"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
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
              <div className="flex items-center justify-between px-5 py-4 border-t border-[#2E2925]">
                <span className="text-xs text-[#8A8278]/40">
                  Página {page} de {pages} · {total} productos
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchProducts(p) }}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-sm bg-[#2A2520] border border-[#2E2925] text-[11px] uppercase tracking-[0.12em] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, pages - 4)) + i
                      if (p < 1 || p > pages) return null
                      return (
                        <button
                          key={p}
                          onClick={() => { setPage(p); fetchProducts(p) }}
                          className={`w-8 h-8 rounded-sm text-xs font-medium transition-all duration-300 ${
                            p === page
                              ? 'bg-[#C9A55A] text-[#1A1714]'
                              : 'bg-[#2A2520] border border-[#2E2925] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830]'
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
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-sm bg-[#2A2520] border border-[#2E2925] text-[11px] uppercase tracking-[0.12em] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
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