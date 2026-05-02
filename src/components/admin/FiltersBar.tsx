'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface FiltersBarProps {
  categories: Category[]
}

export function FiltersBar({ categories }: FiltersBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statusFilter = searchParams.get('status') || 'all'
  const categoryFilter = searchParams.get('category') || 'all'
  const sortBy = searchParams.get('sort') || 'newest'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/admin')
  }

  const hasFilters = statusFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'newest'

  return (
    <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          <span className="text-xs text-white/40 font-medium">Filtros:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="bg-[--bg-surface] border border-[--border] rounded-lg h-9 px-3 text-xs text-white/70 appearance-none cursor-pointer hover:border-white/10 transition-all"
        >
          <option value="all">Todos los estados</option>
          <option value="AVAILABLE">Disponible</option>
          <option value="PREORDER">Por pedido</option>
          <option value="OUT_OF_STOCK">Sin stock</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="bg-[--bg-surface] border border-[--border] rounded-lg h-9 px-3 text-xs text-white/70 appearance-none cursor-pointer hover:border-white/10 transition-all"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="bg-[--bg-surface] border border-[--border] rounded-lg h-9 px-3 text-xs text-white/70 appearance-none cursor-pointer hover:border-white/10 transition-all"
        >
          <option value="newest">Más reciente</option>
          <option value="oldest">Más antiguo</option>
          <option value="price-asc">Precio menor</option>
          <option value="price-desc">Precio mayor</option>
          <option value="name">Nombre A-Z</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[--red]/10 border border-[--red]/20 text-[11px] text-[--red] hover:bg-[--red]/20 transition-all"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>
    </div>
  )
}