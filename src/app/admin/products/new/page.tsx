'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import {
  ArrowLeft, Check, Loader2, Package, Star, Hash, Wand2,
  Sparkles, ChevronDown
} from 'lucide-react'

interface Category {
  id: string
  name: string
  parentId: string | null
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<{key: string; value: string}[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
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
          images: images.length > 0 ? JSON.stringify(images) : null,
          imageUrl: images[0] || null,
          categoryName: category?.name || null,
          specifications: specs,
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

  const handleImageUpload = (url: string) => {
    if (url && !images.includes(url)) {
      setImages(prev => [...prev, url])
    }
  }

  const removeImage = (url: string) => {
    setImages(prev => prev.filter(i => i !== url))
  }

  const generateSpecs = async () => {
    if (!formData.name || !formData.description) {
      alert('Completa nombre y descripción primero')
      return
    }
    setGenerating(true)
    try {
      const category = categories.find(c => c.id === formData.categoryId)
      const res = await fetch('/api/gemini/generate-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          description: formData.description,
          category: category?.name || 'General',
        })
      })
      const data = await res.json()
      if (data.specifications) {
        setSpecs(data.specifications)
      } else {
        alert(data.error || 'Error generando especificaciones')
      }
    } catch (e) {
      alert('Error de conexión con la IA')
    } finally {
      setGenerating(false)
    }
  }

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...specs]
    next[i][field] = val
    setSpecs(next)
  }
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i))

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
            {/* Múltiples Imágenes */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-3">
                <Package className="w-3 h-3" /> Imágenes
              </label>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {images.map((url) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container ring-1 ring-white/[0.04]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs hover:bg-error/80 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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
                  {categories.filter(c => !c.parentId).map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.id}>{cat.name} (principal)</option>
                      {categories.filter(c => c.parentId === cat.id).map(sub => (
                        <option key={sub.id} value={sub.id}>└ {sub.name}</option>
                      ))}
                    </optgroup>
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

            {/* Especificaciones con IA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
                  <Sparkles className="w-3 h-3" /> Especificaciones
                </label>
                <button
                  type="button"
                  onClick={generateSpecs}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  {generating ? 'Generando...' : 'Generar con IA'}
                </button>
              </div>

              <div className="space-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={spec.key}
                      onChange={e => updateSpec(i, 'key', e.target.value)}
                      placeholder="Característica"
                      className="flex-1 bg-surface-container border border-white/[0.06] rounded-lg py-2 px-3 text-xs text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                    />
                    <input
                      value={spec.value}
                      onChange={e => updateSpec(i, 'value', e.target.value)}
                      placeholder="Valor"
                      className="flex-1 bg-surface-container border border-white/[0.06] rounded-lg py-2 px-3 text-xs text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      className="px-2 text-on-surface-variant/40 hover:text-error transition-colors text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSpec}
                className="mt-2 text-xs text-primary font-medium hover:underline"
              >
                + Agregar especificación manualmente
              </button>
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
