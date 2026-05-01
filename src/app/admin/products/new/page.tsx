'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import { ArrowLeft, Check, Loader2, Wand2, Plus, X } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Category { id: string; name: string; parentId: string | null }

export default function NewProductPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPrice: '',
    status: 'AVAILABLE', categoryId: '', featured: false,
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const cat = categories.find(c => c.id === formData.categoryId)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.length ? JSON.stringify(images) : null,
          imageUrl: images[0] || null,
          categoryName: cat?.name || null,
          specifications: specs.filter(s => s.key && s.value),
        }),
      })
      if (res.ok) {
        showToast('Producto creado correctamente', 'success')
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al crear', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value })
  }

  const generateSpecs = async () => {
    if (!formData.name || !formData.description) {
      showToast('Completá nombre y descripción primero', 'error')
      return
    }
    setGenerating(true)
    try {
      const cat = categories.find(c => c.id === formData.categoryId)
      const res = await fetch('/api/gemini/generate-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          description: formData.description,
          category: cat?.name || 'General',
        }),
      })
      const data = await res.json()
      if (data.specifications) {
        setSpecs(data.specifications)
        showToast(`${data.specifications.length} especificaciones generadas`, 'success')
      } else {
        showToast(data.error || 'Error generando especificaciones', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => {
    const n = [...specs]; n[i][field] = val; setSpecs(n)
  }
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i))

  return (
    <div className="min-h-screen bg-[#1A1714]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161310]/95 backdrop-blur-md border-b border-[#2E2925]/60">
        <div className="flex items-center h-12 px-4 gap-3 max-w-7xl mx-auto">
          <Link href="/admin" className="p-1.5 -ml-1 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 rounded-sm">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <h1 className="font-serif text-sm font-light text-[#F0EAE0] tracking-[0.02em]">Nuevo producto</h1>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-2xl mx-auto py-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Images */}
          <div className="bg-[#221E1A] border border-[#2E2925] rounded-sm p-5">
            <label className="text-[11px] font-normal uppercase tracking-[0.12em] text-[#C9A55A] mb-3 block">
              Imágenes del producto
            </label>
            <ImageUpload onUpload={urls => setImages(urls)} multiple />
          </div>

          {/* Core fields */}
          <div className="bg-[#221E1A] border border-[#2E2925] rounded-sm p-5 space-y-5">
            <FieldLabel>Información básica</FieldLabel>

            <div>
              <label className="field-label">Nombre del producto *</label>
              <input
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="field-input"
                placeholder="Ej: Sony WH-1000XM5"
              />
            </div>

            <div>
              <label className="field-label">Descripción *</label>
              <textarea
                name="description" rows={4} required
                value={formData.description} onChange={handleChange}
                className="w-full bg-transparent border-b border-[#3D3830] p-3 text-sm text-[#F0EAE0] placeholder-[#8A8278]/30 focus:outline-none focus:border-[#C9A55A] transition-colors resize-none leading-relaxed"
                placeholder="Descripción detallada del producto…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Precio (ARS) *</label>
                <input
                  type="number" name="price" step="0.01" min="0" required
                  value={formData.price} onChange={handleChange}
                  className="field-input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="field-label">Precio original <span className="text-[#8A8278]/40 normal-case font-normal normal-case">(si hay oferta)</span></label>
                <input
                  type="number" name="discountPrice" step="0.01" min="0"
                  value={formData.discountPrice} onChange={handleChange}
                  className="field-input"
                  placeholder="Sin oferta"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Estado</label>
                <select
                  name="status" value={formData.status} onChange={handleChange}
                  className="field-input appearance-none"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="PREORDER">Por pedido</option>
                  <option value="OUT_OF_STOCK">Sin stock</option>
                </select>
              </div>
              <div>
                <label className="field-label">Categoría</label>
                <select
                  name="categoryId" value={formData.categoryId} onChange={handleChange}
                  className="field-input appearance-none"
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

            <label className="flex items-center gap-2.5 p-3 rounded-sm bg-[#2A2520] border border-[#2E2925] cursor-pointer hover:border-[#3D3830] transition-colors duration-300">
              <input
                type="checkbox" name="featured"
                checked={formData.featured} onChange={handleChange}
                className="w-4 h-4 rounded accent-[#C9A55A]"
              />
              <div>
                <span className="text-sm text-[#F0EAE0]/70 font-medium">Producto destacado</span>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278]">Aparece en la sección destacados del catálogo</p>
              </div>
            </label>
          </div>

          {/* Specifications */}
          <div className="bg-[#221E1A] border border-[#2E2925] rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <FieldLabel>Especificaciones técnicas</FieldLabel>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8278] mt-0.5">Características y datos técnicos del producto</p>
              </div>
              <button
                type="button" onClick={generateSpecs} disabled={generating}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm bg-[#C9A55A]/10 border border-[#C9A55A]/20 text-[11px] uppercase tracking-[0.12em] text-[#C9A55A] hover:bg-[#C9A55A]/20 transition-all duration-300 disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                {generating ? 'Generando…' : 'Generar con IA'}
              </button>
            </div>

            {specs.length > 0 && (
              <div className="space-y-2 mb-3">
                {specs.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)}
                      placeholder="Característica"
                      className="flex-1 bg-transparent border-b border-[#3D3830] h-10 px-3 text-sm text-[#F0EAE0] placeholder-[#8A8278]/30 focus:outline-none focus:border-[#C9A55A] transition-colors"
                    />
                    <input
                      value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)}
                      placeholder="Valor"
                      className="flex-1 bg-transparent border-b border-[#3D3830] h-10 px-3 text-sm text-[#F0EAE0] placeholder-[#8A8278]/30 focus:outline-none focus:border-[#C9A55A] transition-colors"
                    />
                    <button
                      type="button" onClick={() => removeSpec(i)}
                      className="p-2 text-[#8A8278] hover:text-[#C0392B] hover:bg-[#C0392B]/5 rounded-sm transition-all duration-300 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button" onClick={addSpec}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#C9A55A]/60 hover:text-[#C9A55A] transition-colors duration-300"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar especificación
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Link
              href="/admin"
              className="h-11 px-6 rounded-sm border border-[#2E2925] bg-transparent text-[12px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all duration-300 flex items-center"
            >
              Cancelar
            </Link>
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[12px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? 'Creando…' : 'Crear producto'}
            </button>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #C9A55A;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #3D3830;
          border-radius: 0;
          height: 44px;
          padding: 0 0 0 0;
          font-size: 14px;
          color: #F0EAE0;
          outline: none;
          transition: border-color 0.3s ease;
        }
        .field-input:focus {
          border-bottom-color: #C9A55A;
        }
        .field-input::placeholder {
          color: rgb(138 130 120 / 0.30);
        }
      `}</style>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[#C9A55A]">{children}</p>
  )
}
