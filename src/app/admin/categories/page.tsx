'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Pencil, Trash2, FolderOpen,
  Hash, Type, AlignLeft, Check, X, Loader2,
  ChevronDown, ChevronRight
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  active: boolean
  parentId: string | null
  _count?: { products: number }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    order: 0,
    parentId: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await fetch(`/api/categories/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          }),
        })
      }
      setFormOpen(false)
      setEditing(null)
      setFormData({ name: '', slug: '', description: '', icon: '', order: 0, parentId: '' })
      fetchCategories()
      router.refresh()
    } catch (e) {
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    fetchCategories()
    router.refresh()
  }

  const startEdit = (cat: Category) => {
    setEditing(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      order: cat.order,
      parentId: cat.parentId || '',
    })
    setFormOpen(true)
  }

  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex items-center h-14">
            <Link href="/admin" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors mr-4">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <h1 className="font-serif text-base sm:text-lg font-medium text-on-surface">Categorías</h1>
          </div>
        </div>
      </header>

      <div className="h-14" />

      <main className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-16">
        <button
          onClick={() => {
            setEditing(null)
            setFormData({ name: '', slug: '', description: '', icon: '', order: 0, parentId: '' })
            setFormOpen(!formOpen)
          }}
          className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/10"
        >
          {formOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {formOpen ? 'Cancelar' : 'Nueva Categoría'}
        </button>

        {formOpen && (
          <div className="glass p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/[0.06] mb-8 animate-fade-in-up">
            <h3 className="font-serif text-base mb-5 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              {editing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Type className="w-3 h-3" /> Nombre
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Hash className="w-3 h-3" /> Slug
                </label>
                <input
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tecnologia"
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <AlignLeft className="w-3 h-3" /> Icono (Lucide)
                </label>
                <input
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="laptop"
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <FolderOpen className="w-3 h-3" /> Categoría Padre
                </label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1a1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Hash className="w-3 h-3" /> Orden
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <AlignLeft className="w-3 h-3" /> Descripción
                </label>
                <input
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant text-sm">Cargando...</div>
        ) : (
          <div className="glass rounded-xl sm:rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="sm:hidden divide-y divide-white/[0.04]">
              {categories.filter(c => !c.parentId).map((cat) => (
                <div key={cat.id}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-on-surface">{cat.name}</div>
                        <div className="text-[11px] text-on-surface-variant/50">/{cat.slug} · {cat._count?.products ?? 0} productos</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(cat)} className="p-2 rounded-lg border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg border border-error/20 text-error/70 hover:bg-error/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {categories.filter(c => c.parentId === cat.id).map(sub => (
                    <div key={sub.id} className="px-4 py-3 pl-12 flex items-center justify-between bg-white/[0.01]">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-on-surface-variant/30" />
                        <span className="text-sm text-on-surface-variant">{sub.name}</span>
                        <span className="text-[10px] text-on-surface-variant/40">({sub._count?.products ?? 0})</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(sub)} className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-primary transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg text-error/50 hover:text-error transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="border-b border-white/[0.04] text-left text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/50">
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Productos</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.parentId && <ChevronRight className="w-3 h-3 text-on-surface-variant/30" />}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.parentId ? 'bg-surface-container' : 'bg-primary/5 border border-primary/10'}`}>
                          <FolderOpen className={`w-4 h-4 ${cat.parentId ? 'text-on-surface-variant/40' : 'text-primary'}`} />
                        </div>
                        <span className={`font-medium text-sm ${cat.parentId ? 'text-on-surface-variant' : 'text-on-surface'}`}>{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant/50 font-mono text-xs">/{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant/50">{cat._count?.products ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(cat)} className="p-2 rounded-lg border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg border border-error/20 text-error/70 hover:bg-error/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
