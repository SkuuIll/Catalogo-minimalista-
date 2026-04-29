'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  active: boolean
  _count?: { products: number }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    order: 0,
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
      setFormData({ name: '', slug: '', description: '', icon: '', order: 0 })
      fetchCategories()
      router.refresh()
    } catch (e) {
      alert('Error al guardar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return
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
    })
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-on-surface">Categorías</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Gestiona las categorías del catálogo</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
              ← Volver
            </Link>
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(null)
            setFormData({ name: '', slug: '', description: '', icon: '', order: 0 })
            setFormOpen(!formOpen)
          }}
          className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide hover:-translate-y-0.5 transition-transform"
        >
          {formOpen ? 'Cancelar' : '+ Nueva Categoría'}
        </button>

        {formOpen && (
          <div className="glass p-5 sm:p-6 rounded-xl border border-white/5 mb-8 animate-fade-in-up">
            <h3 className="font-serif text-lg mb-4">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Nombre</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Slug (opcional)</label>
                <input
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tecnologia"
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface placeholder-on-surface-variant/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Icono (emoji)</label>
                <input
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="💻"
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface placeholder-on-surface-variant/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Orden</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Descripción</label>
                <input
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
                  {editing ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Cargando...</div>
        ) : (
          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="sm:hidden divide-y divide-white/5">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-on-surface">{cat.name}</div>
                      <div className="text-xs text-on-surface-variant">/{cat.slug} · {cat._count?.products ?? 0} productos</div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => startEdit(cat)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors">Editar</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-xs px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-[0.1em] text-on-surface-variant">
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Productos</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-bright/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium text-on-surface">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">/{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{cat._count?.products ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(cat)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors">Editar</button>
                        <button onClick={() => handleDelete(cat.id)} className="text-xs px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
