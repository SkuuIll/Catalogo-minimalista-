'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import { ArrowLeft, Check, Loader2, Wand2 } from 'lucide-react'

interface Category { id: string; name: string; parentId: string | null }

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<{key: string; value: string}[]>([])
  const [formData, setFormData] = useState({ name: '', description: '', price: '', status: 'AVAILABLE', categoryId: '', featured: false })

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const [cats, prod] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch(`/api/products/${id}`).then(r => r.json())
      ])
      setCategories(cats)
      if (!prod.error) {
        setFormData({
          name: prod.name, description: prod.description,
          price: prod.price?.toString() || '', status: prod.status || 'AVAILABLE',
          categoryId: prod.categoryId || '', featured: prod.featured || false,
        })
        let imgs: string[] = []
        try { if (prod.images) imgs = JSON.parse(prod.images) } catch {}
        if (!imgs.length && (prod.imagePath || prod.imageUrl)) imgs = [prod.imagePath || prod.imageUrl || '']
        setImages(imgs.filter(Boolean))
        setSpecs((prod.specifications || []).map((s: any) => ({ key: s.key, value: s.value })))
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const cat = categories.find(c => c.id === formData.categoryId)
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, images: images.length ? JSON.stringify(images) : null, imageUrl: images[0] || null, categoryName: cat?.name || null, specifications: specs })
      })
      if (res.ok) { router.push('/admin'); router.refresh() }
      else alert('Error al actualizar')
    } catch { alert('Error de conexión') }
    finally { setSaving(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value })
  }

  const generateSpecs = async () => {
    if (!formData.name || !formData.description) { alert('Completa nombre y descripción'); return }
    setGenerating(true)
    try {
      const cat = categories.find(c => c.id === formData.categoryId)
      const res = await fetch('/api/gemini/generate-specs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: formData.name, description: formData.description, category: cat?.name || 'General' })
      })
      const data = await res.json()
      if (data.specifications) setSpecs(data.specifications)
      else alert(data.error || 'Error generando')
    } catch { alert('Error de conexión') }
    finally { setGenerating(false) }
  }

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const updateSpec = (i: number, field: 'key' | 'value', val: string) => { const n = [...specs]; n[i][field] = val; setSpecs(n) }
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i))

  if (loading) return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center">
      <div className="flex items-center gap-2 text-white/20 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#060606]">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center h-11 px-4 gap-3">
          <Link href="/admin" className="p-1 -ml-1 text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <h1 className="font-serif text-sm font-medium text-white">Editar producto</h1>
        </div>
      </header>

      <div className="h-11" />

      <main className="max-w-xl mx-auto py-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25 mb-3 block">Imágenes</label>
            <ImageUpload onUpload={urls => setImages(urls)} defaultImages={images} multiple />
          </div>

          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Nombre</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Descripción</label>
              <textarea name="description" rows={4} required value={formData.description} onChange={handleChange}
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl p-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Precio USD</label>
                <input type="number" name="price" step="0.01" min="0" required value={formData.price} onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Estado</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all appearance-none">
                  <option value="AVAILABLE">Disponible</option>
                  <option value="PREORDER">Por pedido</option>
                  <option value="OUT_OF_STOCK">Sin stock</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Categoría</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all appearance-none">
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
            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] cursor-pointer">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 rounded accent-[#bf9b4e]" />
              <span className="text-[13px] text-white/60">Producto destacado</span>
            </label>
          </div>

          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25">Especificaciones</label>
              <button type="button" onClick={generateSpecs} disabled={generating}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#111] border border-[#1a1a1a] text-[11px] text-white/50 hover:text-white hover:border-white/10 transition-all disabled:opacity-50">
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                {generating ? 'Generando' : 'IA'}
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="Característica"
                    className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-xl h-10 px-3 text-[12px] text-white placeholder-white/10 focus:outline-none focus:border-white/10 transition-all" />
                  <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Valor"
                    className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-xl h-10 px-3 text-[12px] text-white placeholder-white/10 focus:outline-none focus:border-white/10 transition-all" />
                  <button type="button" onClick={() => removeSpec(i)} className="px-2 text-white/15 hover:text-[#e05555] transition-colors">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSpec} className="mt-3 text-[11px] text-white/30 hover:text-white/60 transition-colors">+ Agregar especificación</button>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Guardando' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
