import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from './LogoutButton'
import { DeleteProductButton } from './DeleteProductButton'
import { Package, FolderOpen, Star, ShoppingBag, Plus, Settings, Pencil, AlertTriangle, TrendingUp, Eye, Tag } from 'lucide-react'

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  const totalValue = products.reduce((a, p) => a + p.price, 0)
  const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length
  const preorder = products.filter(p => p.status === 'PREORDER').length
  const onSale = products.filter(p => p.discountPrice).length

  return (
    <div className="min-h-screen bg-[#060606]">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex justify-between items-center h-11 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#bf9b4e]" />
            </div>
            <h1 className="font-serif text-sm font-medium text-white">Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors">
              <Eye className="w-3 h-3" /> Tienda
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="h-11" />

      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-5">
          <Stat value={products.length} label="Productos" />
          <Stat value={categories.length} label="Categorías" />
          <Stat value={products.filter(p => p.featured).length} label="Destacados" />
          <Stat value={onSale} label="En oferta" />
          <Stat value={`$${totalValue.toFixed(0)}`} label="Valor total" />
        </div>

        {/* Alerts */}
        {(outOfStock > 0 || preorder > 0 || onSale > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {outOfStock > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e05555]/5 border border-[#e05555]/10 text-[11px] text-[#e05555] font-medium">
                <AlertTriangle className="w-3 h-3" />
                {outOfStock} sin stock
              </span>
            )}
            {preorder > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d4a030]/5 border border-[#d4a030]/10 text-[11px] text-[#d4a030] font-medium">
                <TrendingUp className="w-3 h-3" />
                {preorder} por pedido
              </span>
            )}
            {onSale > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e05555]/5 border border-[#e05555]/10 text-[11px] text-[#e05555] font-medium">
                <Star className="w-3 h-3" />
                {onSale} en oferta
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mb-5">
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all">
            <Plus className="w-3.5 h-3.5" /> Nuevo
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#111] border border-[#1a1a1a] text-white/60 text-xs font-medium hover:text-white hover:border-white/10 transition-all">
            <FolderOpen className="w-3.5 h-3.5" /> Categorías
          </Link>
          <Link href="/admin/settings" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#111] border border-[#1a1a1a] text-white/60 text-xs font-medium hover:text-white hover:border-white/10 transition-all">
            <Settings className="w-3.5 h-3.5" /> Config
          </Link>
        </div>

        {/* Products */}
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25 mb-3">Productos</h2>

        <div className="border border-[#1a1a1a] rounded-2xl overflow-hidden divide-y divide-[#1a1a1a]">
          {products.length === 0 ? (
            <div className="p-12 text-center text-white/20 text-sm">No hay productos.</div>
          ) : (
            products.map(product => (
              <div key={product.id} className="p-3 sm:p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#111] border border-[#1a1a1a] overflow-hidden">
                      {(product.imagePath || product.imageUrl) ? (
                        <img src={(product.imagePath || product.imageUrl) || ''} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-white/10" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{product.name}</span>
                        <StatusBadge status={product.status} />
                      </div>
                      <div className="text-xs text-white/30 mt-0.5">
                        {product.category?.name || product.categoryName || 'Sin categoría'} · <span className="text-[#bf9b4e]">${product.price.toFixed(2)}</span>
                        {product.featured && <span className="ml-2 text-[#bf9b4e]/60">· Destacado</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/admin/products/${product.id}/edit`} className="p-2 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <DeleteProductButton id={product.id} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
      <div className="text-xl font-bold text-white tracking-tight mb-0.5">{value}</div>
      <div className="text-[10px] text-white/25 font-medium">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = {
    AVAILABLE: 'text-[#3cb371] bg-[#3cb371]/5',
    PREORDER: 'text-[#d4a030] bg-[#d4a030]/5',
    OUT_OF_STOCK: 'text-[#e05555] bg-[#e05555]/5',
  }
  const l = { AVAILABLE: 'Stock', PREORDER: 'Pedido', OUT_OF_STOCK: 'Agotado' }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${s[status as keyof typeof s] || s.AVAILABLE}`}>
      {l[status as keyof typeof l] || status}
    </span>
  )
}
