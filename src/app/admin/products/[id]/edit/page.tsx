'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import { ArrowLeft, Check, Loader2, Wand2, Plus, X, Eye } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Category { id: string; name: string; parentId: string | null }

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [productName, setProductName] = useState('')
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPrice: '',
    status: 'AVAILABLE', categoryId: '', featured: false,
  })

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [cats, prod] = await Promise.all([
          fetch('/api/categories').then(r => r.json()),
          fetch(`/api/products/${id}`).then(r => r.json()),
        ])
        setCategories(cats)
        if (!prod.error) {
          setProductName(prod.name)
          setFormData({
            name: prod.name,
            description: prod.description,
            price: prod.price?.toString() || '',
            discountPrice: prod.discountPrice?.toString() || '',
            status: prod.status || 'AVAILABLE',
            categoryId: prod.categoryId || '',
            featured: prod.featured || false,
          })
          let imgs: string[] = []
          try { if (prod.images) imgs = JSON.parse(prod.images) } catch {}
          if (!imgs.length && (prod.imagePath || prod.imageUrl)) {
            imgs = [prod.imagePath || prod.imageUrl || ''].filter(Boolean)
          }
          setImages(imgs.filter(Boolean))
          setSpecs((prod.specifications || []).map((s: any) => ({ key: s.key, value: s.value })))
        } else {
          showToast('Producto no encontrado', 'error')
          router.push('/admin')
        }
      } catch {
        showToast('Error al cargar producto', 'error')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const cat = categories.find(c => c.id === formData.categoryId)
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
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
        showToast('Producto actualizado', 'success')
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al actualizar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setSaving(false)
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
        showToast(data.error || 'Error generando', 'error')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[--text-secondary]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[13px] font-medium">Cargando producto…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[--bg]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[--bg]/95 backdrop-blur-md border-b border-[--border]">
        <div className="flex items-center h-14 px-4 gap-3 max-w-7xl mx-auto">
          <Link href="/admin" className="p-2 -ml-2 text-[--text-secondary] hover:text-[--text] transition-colors duration-300 rounded-lg">
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-[15px] text-[--text] tracking-wide truncate">
              {productName || 'Editar producto'}
            </h1>
          </div>
          <Link
            href={`/product/${id}`}
            target="_blank"
            className="ml-auto inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[--bg-surface] border border-[--border] text-[11px] font-bold tracking-wide text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] hover:border-[--border-mid] transition-all duration-300"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> Ver
          </Link>
        </div>
      </header>

      <div className="h-14" />

      <main className="max-w-2xl mx-auto py-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Images */}
          <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-5">
            <label className="text-[12px] font-semibold tracking-wide text-[--text] mb-3 block">
              Imágenes del producto
            </label>
            <ImageUpload onUpload={urls => setImages(urls)} defaultImages={images} multiple />
          </div>

          {/* Core fields */}
          <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-5 space-y-5">
            <FieldLabel>Información básica</FieldLabel>

            <div>
              <label className="field-label">Nombre del producto *</label>
              <input
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Descripción *</label>
              <textarea
                name="description" rows={4} required
                value={formData.description} onChange={handleChange}
                className="w-full bg-transparent border-b border-[--border-mid] py-3 text-[14px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent] transition-colors resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <div>
                <label className="field-label">Precio (ARS) *</label>
                <input
                  type="number" name="price" step="0.01" min="0" required
                  value={formData.price} onChange={handleChange}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Precio original <span className="text-[--text-tertiary] font-normal normal-case">(si hay oferta)</span></label>
                <input
                  type="number" name="discountPrice" step="0.01" min="0"
                  value={formData.discountPrice} onChange={handleChange}
                  placeholder="Sin oferta"
                  className="field-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <div>
                <label className="field-label">Estado</label>
                <select
                  name="status" value={formData.status} onChange={handleChange}
                  className="field-input appearance-none bg-transparent"
                >
                  <option value="AVAILABLE" className="bg-[--bg-surface]">Disponible</option>
                  <option value="PREORDER" className="bg-[--bg-surface]">Por encargo</option>
                  <option value="OUT_OF_STOCK" className="bg-[--bg-surface]">Agotado</option>
                </select>
              </div>
              <div>
                <label className="field-label">Categoría</label>
                <select
                  name="categoryId" value={formData.categoryId} onChange={handleChange}
                  className="field-input appearance-none bg-transparent"
                >
                  <option value="" className="bg-[--bg-surface]">Sin categoría</option>
                  {categories.filter(c => !c.parentId).map(cat => (
                    <optgroup key={cat.id} label={cat.name} className="bg-[--bg-surface]">
                       <option value={cat.id}>{cat.name} (principal)</option>
                      {categories.filter(c => c.parentId === cat.id).map(sub => (
                        <option key={sub.id} value={sub.id}>└ {sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-[--bg-elevated] border border-[--border] cursor-pointer hover:border-[--border-mid] transition-colors duration-300">
              <input
                type="checkbox" name="featured"
                checked={formData.featured} onChange={handleChange}
                className="w-5 h-5 rounded accent-[--accent]"
              />
              <div>
                <span className="text-[13px] font-semibold text-[--text]">Producto destacado</span>
                <p className="text-[11px] text-[--text-tertiary] mt-0.5">Aparece grande al inicio del catálogo</p>
              </div>
            </label>
          </div>

          {/* Specifications */}
          <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <FieldLabel>Especificaciones</FieldLabel>
                <p className="text-[11px] text-[--text-tertiary] mt-1">{specs.length > 0 ? `${specs.length} especificaciones` : 'Sin especificaciones aún'}</p>
              </div>
              <button
                type="button" onClick={generateSpecs} disabled={generating}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-[--accent-soft] text-[--accent] text-[11px] font-bold tracking-wide hover:opacity-80 transition-all duration-300 disabled:opacity-50 w-full sm:w-auto"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {generating ? 'Generando…' : 'Autocompletar con IA'}
              </button>
            </div>

            {specs.length > 0 && (
              <div className="space-y-3 mb-4">
                {specs.map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-[--bg-elevated] p-3 rounded-xl border border-[--border]">
                    <input
                      value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)}
                      placeholder="Ej: Material"
                      className="w-full bg-transparent border-b border-[--border-mid] h-10 px-1 text-[13px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent] transition-colors"
                    />
                    <input
                      value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)}
                      placeholder="Ej: Cuero sintético"
                      className="w-full bg-transparent border-b border-[--border-mid] h-10 px-1 text-[13px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent] transition-colors"
                    />
                    <button
                      type="button" onClick={() => removeSpec(i)}
                      className="p-2 self-end sm:self-auto text-[--text-tertiary] hover:text-[--red] hover:bg-[--red]/10 rounded-lg transition-all duration-300 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button" onClick={addSpec}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[--text-secondary] hover:text-[--text] transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
              AGREGAR FILA
            </button>
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8 pt-2">
            <Link
              href="/admin"
              className="h-12 sm:h-11 px-6 rounded-xl border border-[--border] bg-transparent text-[12px] font-bold tracking-wide text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-elevated] transition-all duration-300 flex items-center justify-center"
            >
              Cancelar
            </Link>
            <button
              type="submit" disabled={saving}
              className="inline-flex items-center justify-center gap-2 h-12 sm:h-11 px-8 rounded-xl bg-[--accent] text-[--bg] text-[12px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-mid);
          border-radius: 0;
          height: 44px;
          padding: 0;
          font-size: 14px;
          color: var(--text);
          outline: none;
          transition: border-color 0.3s ease;
        }
        .field-input:focus {
          border-bottom-color: var(--accent);
        }
        .field-input::placeholder {
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-bold text-[--text] border-b border-[--border] pb-3 mb-1">{children}</h3>
  )
}
