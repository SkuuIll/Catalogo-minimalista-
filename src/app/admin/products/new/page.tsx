'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import {
  ArrowLeft, Check, Loader2, Package, Star, Hash
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    imagePath: '',
    featured: false,
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const category = categories.find(c => c.id === formData.categoryId)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryName: category?.name || null,
        })
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        alert('Error al crear el producto')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleImageUpload = (url: string, filename?: string) => {
    if (url.startsWith('/uploads/')) {
      setFormData(prev => ({ ...prev, imagePath: url, imageUrl: '' }))
    } else {
      setFormData(prev => ({ ...prev, imageUrl: url, imagePath: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex items-center h-14">
            <Link href="/admin" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors mr-4">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <h1 className="font-serif text-base sm:text-lg font-medium text-on-surface">Nuevo Producto</h1>
          </div>
        </div>
      </header>

      <div className="h-14" />

      <main className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-16">
        <div className="glass p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/[0.06]">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Imagen */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-3">
                <Package className="w-3 h-3" /> Imagen del Producto
              </label>
              <ImageUpload onUpload={handleImageUpload} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-2">
                <Package className="w-3 h-3" /> Nombre
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 focus:outline-none focus:border-primary/40 text-sm sm:text-base text-on-surface transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-2">
                <Package className="w-3 h-3" /> Descripción
              </label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="block w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 focus:outline-none focus:border-primary/40 text-sm text-on-surface transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-y-5 sm:gap-y-6 gap-x-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-2">
                  <Hash className="w-3 h-3" /> Precio (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 focus:outline-none focus:border-primary/40 text-sm sm:text-base text-on-surface transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-2">
                  <Package className="w-3 h-3" /> Categoría
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="block w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 focus:outline-none focus:border-primary/40 text-sm text-on-surface transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1a1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container/50 border border-white/[0.04]">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
              />
              <label htmlFor="featured" className="text-sm text-on-surface flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-on-surface-variant/50" />
                Producto destacado
              </label>
            </div>

            <div className="pt-2 sm:pt-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-primary-container to-[#8E6E37] text-sm font-semibold tracking-[0.05em] text-on-primary hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? 'Registrando...' : 'Registrar Producto'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
