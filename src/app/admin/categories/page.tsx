'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Pencil, Trash2, FolderOpen,
  X, Loader2, ChevronRight
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { DeleteDialog } from '@/components/Dialog'

interface Category {
  id: string; name: string; slug: string; description: string | null; icon: string | null
  order: number; active: boolean; parentId: string | null; _count?: { products: number }
}

const defaultForm = { name: '', slug: '', description: '', icon: '', order: 0, active: true, parentId: '' }

export default function CategoriesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(defaultForm)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const data = await fetch('/api/categories').then(r => r.json())
      setCategories(data)
    } catch {
      showToast('Error al cargar categorías', 'error')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories'
      const method = editing ? 'PATCH' : 'POST'
      const slug = formData.slug || formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setFormOpen(false)
      setEditing(null)
      setFormData(defaultForm)
      showToast(editing ? 'Categoría actualizada' : 'Categoría creada', 'success')
      fetchCategories()
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Categoría eliminada', 'success')
        fetchCategories()
        router.refresh()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al eliminar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const startEdit = (cat: Category) => {
    setEditing(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      order: cat.order,
      active: cat.active,
      parentId: cat.parentId || '',
    })
    setFormOpen(true)
    // Scroll to form
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const openNew = () => {
    setEditing(null)
    setFormData(defaultForm)
    setFormOpen(true)
  }

  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-[#060606]">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center h-12 px-4 gap-3">
          <Link href="/admin" className="p-1.5 -ml-1 text-white/30 hover:text-white/60 transition-colors rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-serif text-sm font-medium text-white">Categorías</h1>
          <span className="ml-auto text-[11px] text-white/25">{categories.length} categorías</span>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={formOpen && !editing ? () => setFormOpen(false) : openNew}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            {formOpen && !editing ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {formOpen && !editing ? 'Cancelar' : 'Nueva categoría'}
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 mb-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#bf9b4e]" />
                {editing ? `Editando: ${editing.name}` : 'Nueva categoría'}
              </h3>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setEditing(null) }}
                className="p-1 text-white/20 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Nombre *"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <FormInput
                label="Slug"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generado"
              />
              <FormInput
                label="Orden"
                type="number"
                value={String(formData.order)}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <FormInput
                label="Icono (nombre Lucide)"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                placeholder="laptop, watch, shirt…"
              />

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30 mb-1.5 block">
                  Categoría padre
                </label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all appearance-none"
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {parentCategories
                    .filter(c => c.id !== editing?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] cursor-pointer hover:border-white/10 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#bf9b4e]"
                  />
                  <span className="text-sm text-white/60">Categoría activa (visible en la tienda)</span>
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setEditing(null) }}
                  className="h-10 px-4 rounded-xl bg-[#111] border border-[#1a1a1a] text-sm text-white/60 hover:text-white hover:border-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-white text-black text-xs font-semibold disabled:opacity-50 hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {editing ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-medium">No hay categorías</p>
            <p className="text-white/25 text-xs mt-1">Creá tu primera categoría para organizar productos</p>
          </div>
        ) : (
          <div className="border border-[#1a1a1a] rounded-2xl overflow-hidden divide-y divide-[#1a1a1a]">
            {parentCategories.map(cat => (
              <div key={cat.id}>
                {/* Parent category row */}
                <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#1a1a1a]">
                      <FolderOpen className="w-4 h-4 text-[#bf9b4e]/60" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{cat.name}</span>
                        {!cat.active && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/20">Inactiva</span>
                        )}
                      </div>
                      <div className="text-xs text-white/25">/{cat.slug} · {cat._count?.products ?? 0} productos</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-1.5 rounded-lg text-white/15 hover:text-[#e05555] hover:bg-[#e05555]/5 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {categories
                  .filter(c => c.parentId === cat.id)
                  .map(sub => (
                    <div key={sub.id} className="flex items-center justify-between pl-10 pr-4 py-2.5 bg-[#0a0a0a] border-t border-[#1a1a1a]/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight className="w-3 h-3 text-white/10 flex-shrink-0" />
                        <span className="text-sm text-white/50">{sub.name}</span>
                        {!sub.active && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/20">Inactiva</span>
                        )}
                        <span className="text-xs text-white/15">({sub._count?.products ?? 0})</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(sub)}
                          className="p-1.5 rounded-lg text-white/20 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sub)}
                          className="p-1.5 rounded-lg text-white/15 hover:text-[#e05555] hover:bg-[#e05555]/5 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </main>

      <DeleteDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.name || ''}
        itemType="categoría"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function FormInput({
  label, required, ...props
}: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30 mb-1.5 block">{label}</label>
      <input
        required={required}
        className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-white/15 transition-all"
        {...props}
        value={props.value ?? ''}
      />
    </div>
  )
}
