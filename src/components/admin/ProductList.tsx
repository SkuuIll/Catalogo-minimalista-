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
    AVAILABLE: 'text-[#3cb371] bg-[#3cb371]/5 border-[#3cb371]/20',
    PREORDER: 'text-[#c9a55a] bg-[#c9a55a]/5 border-[#c9a55a]/20',
    OUT_OF_STOCK: 'text-[#C0392B] bg-[#C0392B]/5 border-[#C0392B]/20',
  }
  const labels: Record<string, string> = {
    AVAILABLE: 'AVAILABLE',
    PREORDER: 'PRE-ORDER',
    OUT_OF_STOCK: 'OUT OF STOCK',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-none text-[8px] font-medium border uppercase tracking-[0.2em] ${styles[status] || styles.AVAILABLE}`}>
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
  { value: 'all', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'PREORDER', label: 'Pre-order' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'name', label: 'Name A-Z' },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#e8e8e8] tracking-[0.05em]">PRODUCTS</h2>
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#666] mt-1">{total} PIECES IN COLLECTION</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-none border border-[#c9a55a] bg-transparent text-[#c9a55a] text-[9px] uppercase tracking-[0.25em] font-normal hover:bg-[#c9a55a] hover:text-[#0a0a0a] active:scale-[0.98] transition-all duration-300"
        >
          <Plus className="w-4 h-4" strokeWidth={1} /> NEW PIECE
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-sm relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH PIECES"
            className="w-full bg-transparent border-b border-[#1a1a1a] h-11 pl-11 pr-4 text-[13px] uppercase tracking-[0.15em] text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#c9a55a] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300">
              <X className="w-4 h-4" strokeWidth={1} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-none p-0.5">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1); fetchProducts(1) }}
              className={`px-4 py-2 rounded-none text-[8px] uppercase tracking-[0.2em] font-normal transition-all duration-300 ${
                status === opt.value
                  ? 'bg-[#c9a55a] text-[#0a0a0a]'
                  : 'text-[#666] hover:text-[#e8e8e8]'
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
          className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-none h-11 px-4 text-[12px] uppercase tracking-[0.15em] text-[#666] focus:outline-none focus:border-[#2a2a2a] transition-all cursor-pointer appearance-none"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); fetchProducts(1) }}
          className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-none h-11 px-4 text-[12px] uppercase tracking-[0.15em] text-[#666] focus:outline-none focus:border-[#2a2a2a] transition-all cursor-pointer appearance-none"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-none overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#1a1a1a]">
            {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
              <Package className="w-7 h-7 text-[#222]" strokeWidth={1} />
            </div>
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#666] mb-1">
              {search ? 'NO RESULTS' : 'NO PIECES'}
            </p>
            <p className="text-[12px] uppercase tracking-[0.15em] text-[#444] mb-6">
              {search ? `No pieces for "${search}"` : 'Create your first piece'}
            </p>
            {!search && (
              <Link href="/admin/products/new" className="inline-flex items-center gap-2 h-10 px-5 rounded-none border border-[#c9a55a] bg-transparent text-[#c9a55a] text-[9px] uppercase tracking-[0.25em] font-normal hover:bg-[#c9a55a] hover:text-[#0a0a0a] transition-all duration-300">
                <Plus className="w-3.5 h-3.5" strokeWidth={1} /> CREATE PIECE
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666]">PIECE</th>
                    <th className="text-left px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666] hidden md:table-cell">CATEGORY</th>
                    <th className="text-left px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666]">PRICE</th>
                    <th className="text-left px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666]">STATUS</th>
                    <th className="text-center px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666]">AVAILABILITY</th>
                    <th className="text-right px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {products.map(product => {
                    const thumb = getProductThumbnail(product)
                    const hasDiscount = product.discountPrice && product.discountPrice > 0
                    return (
                      <tr key={product.id} className="hover:bg-[#141414] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden flex-shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-[#222]" strokeWidth={1} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-serif font-light text-[#e8e8e8] truncate max-w-[220px] tracking-[0.05em]">{product.name}</span>
                                {product.featured && <Star className="w-4 h-4 text-[#c9a55a] fill-[#c9a55a] flex-shrink-0" strokeWidth={1} />}
                              </div>
                              {hasDiscount && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-[#C0392B]/10 text-[8px] font-bold text-[#C0392B] uppercase tracking-[0.2em] mt-1">
                                  -{discountPercent(product.price, product.discountPrice)}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-[11px] uppercase tracking-[0.15em] text-[#666]">{product.category?.name || product.categoryName || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-[13px] font-serif italic text-[#c9a55a]">{formatARS(product.price)}</span>
                            {hasDiscount && (
                              <span className="block text-[9px] uppercase tracking-[0.15em] text-[#444] line-through mt-0.5">{formatARS(product.discountPrice)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-5 py-4 text-center">
                          {product.status === 'OUT_OF_STOCK' ? (
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#C0392B]">0</span>
                          ) : product.status === 'PREORDER' ? (
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#c9a55a]">PRE-ORDER</span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#3cb371]">IN STOCK</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="p-2 rounded-none text-[#666] hover:text-[#e8e8e8] hover:bg-[#141414] transition-all duration-300"
                              title="View in store"
                            >
                              <Eye className="w-4 h-4" strokeWidth={1} />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 rounded-none text-[#666] hover:text-[#e8e8e8] hover:bg-[#141414] transition-all duration-300"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" strokeWidth={1} />
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
              <div className="flex items-center justify-between px-5 py-4 border-t border-[#1a1a1a]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#444]">
                  PAGE {page} OF {pages} · {total} PIECES
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchProducts(p) }}
                    disabled={page <= 1}
                    className="flex items-center gap-2 h-10 px-4 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] text-[8px] uppercase tracking-[0.2em] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1} /> PREV
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, pages - 4)) + i
                      if (p < 1 || p > pages) return null
                      return (
                        <button
                          key={p}
                          onClick={() => { setPage(p); fetchProducts(p) }}
                          className={`w-9 h-9 rounded-none text-[10px] font-medium uppercase tracking-[0.15em] transition-all duration-300 ${
                            p === page
                              ? 'bg-[#c9a55a] text-[#0a0a0a]'
                              : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a]'
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
                    className="flex items-center gap-2 h-10 px-4 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] text-[8px] uppercase tracking-[0.2em] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    NEXT <ChevronRight className="w-4 h-4" strokeWidth={1} />
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