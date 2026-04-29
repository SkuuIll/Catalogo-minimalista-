'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Pencil, Trash2, FolderOpen,
  X, Loader2, ChevronRight
} from 'lucide-react'

interface Category {
  id: string; name: string; slug: string; description: string | null; icon: string | null
  order: number; active: boolean; parentId: string | null; _count?: { products: number }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '', order: 0, parentId: '' })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const data = await fetch('/api/categories').then(r => r.json())
    setCategories(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch(editing ? `/api/categories/${editing.id}` : '/api/categories', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-') }),
      })
      setFormOpen(false); setEditing(null)
      setFormData({ name: '', slug: '', description: '', icon: '', order: 0, parentId: '' })
      fetchCategories(); router.refresh()
    } catch { alert('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    fetchCategories(); router.refresh()
  }

  const startEdit = (cat: Category) => {
    setEditing(cat)
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', order: cat.order, parentId: cat.parentId || '' })
    setFormOpen(true)
  }

  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-[#060606]">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center h-11 px-4 gap-3">
          <Link href="/admin" className="p-1 -ml-1 text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <h1 className="font-serif text-sm font-medium text-white">Categorías</h1>
        </div>
      </header>

      <div className="h-11" />

      <main className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-white/30">{categories.length} categorías</p>
          <button
            onClick={() => { setEditing(null); setFormData({ name: '', slug: '', description: '', icon: '', order: 0, parentId: '' }); setFormOpen(!formOpen) }}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            {formOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {formOpen ? 'Cancelar' : 'Nueva'}
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 mb-5 space-y-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#bf9b4e]" />
              {editing ? 'Editar' : 'Nueva categoría'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <Input label="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="tecnologia" />
              <Input label="Icono" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="laptop, watch" />
              <Input label="Orden" type="number" value={String(formData.order)} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Padre</label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all appearance-none"
                >
                  <option value="">Ninguna (principal)</option>
                  {parentCategories.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-white text-black text-xs font-semibold disabled:opacity-50">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-white/20 text-sm">Cargando</div>
        ) : (
          <div className="border border-[#1a1a1a] rounded-2xl overflow-hidden divide-y divide-[#1a1a1a]">
            {parentCategories.map(cat => (
              <div key={cat.id}>
                <CategoryRow cat={cat} onEdit={startEdit} onDelete={handleDelete} />
                {categories.filter(c => c.parentId === cat.id).map(sub => (
                  <div key={sub.id} className="pl-8 pr-4 py-3 bg-[#0a0a0a] flex items-center justify-between border-t border-[#1a1a1a]">
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronRight className="w-3 h-3 text-white/10 flex-shrink-0" />
                      <span className="text-sm text-white/50">{sub.name}</span>
                      <span className="text-[11px] text-white/15">({sub._count?.products ?? 0})</span>
                    </div>
                    <div className="flex gap-1">
                      <IconBtn onClick={() => startEdit(sub)} icon={<Pencil className="w-3 h-3" />} />
                      <IconBtn onClick={() => handleDelete(sub.id)} icon={<Trash2 className="w-3 h-3" />} danger />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CategoryRow({ cat, onEdit, onDelete }: { cat: Category; onEdit: (c: Category) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#111] flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-white/30" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{cat.name}</div>
          <div className="text-[11px] text-white/25">/{cat.slug} · {cat._count?.products ?? 0} productos</div>
        </div>
      </div>
      <div className="flex gap-1">
        <IconBtn onClick={() => onEdit(cat)} icon={<Pencil className="w-3 h-3" />} />
        <IconBtn onClick={() => onDelete(cat.id)} icon={<Trash2 className="w-3 h-3" />} danger />
      </div>
    </div>
  )
}

function IconBtn({ onClick, icon, danger }: { onClick: () => void; icon: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-lg transition-all ${danger ? 'text-white/15 hover:text-[#e05555] hover:bg-[#e05555]/5' : 'text-white/20 hover:text-white/60 hover:bg-white/[0.04]'}`}>
      {icon}
    </button>
  )
}

function Input({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">{label}</label>
      <input
        required={required}
        className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white placeholder-white/10 focus:outline-none focus:border-white/10 transition-all"
        {...props}
        value={props.value ?? ''}
      />
    </div>
  )
}
