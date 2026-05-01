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
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const openNew = () => {
    setEditing(null)
    setFormData(defaultForm)
    setFormOpen(true)
  }

  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <div className="min-h-screen bg-[#1A1714]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161310]/95 backdrop-blur-md border-b border-[#2E2925]/60">
        <div className="flex items-center h-12 px-4 gap-3 max-w-7xl mx-auto">
          <Link href="/admin" className="p-1.5 -ml-1 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 rounded-sm">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <h1 className="font-serif text-sm font-light text-[#F0EAE0] tracking-[0.02em]">Categorías</h1>
          <span className="ml-auto text-[11px] uppercase tracking-[0.15em] text-[#8A8278]">{categories.length} categorías</span>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={formOpen && !editing ? () => setFormOpen(false) : openNew}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300"
          >
            {formOpen && !editing ? <X className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {formOpen && !editing ? 'Cancelar' : 'Nueva categoría'}
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="bg-[#221E1A] border border-[#2E2925] rounded-sm p-5 mb-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#F0EAE0] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#C9A55A]" strokeWidth={1.5} />
                {editing ? `Editando: ${editing.name}` : 'Nueva categoría'}
              </h3>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setEditing(null) }}
                className="p-1 text-[#8A8278]/40 hover:text-[#8A8278] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
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
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8278]/50 mb-1.5 block">
                  Categoría padre
                </label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-[#2A2520] border border-[#2E2925] rounded-sm h-11 px-3 text-[13px] text-[#F0EAE0] focus:outline-none focus:border-[#3D3830] transition-all appearance-none"
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
                <label className="flex items-center gap-2.5 p-3 rounded-sm bg-[#2A2520] border border-[#2E2925] cursor-pointer hover:border-[#3D3830] transition-all">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#C9A55A]"
                  />
                  <span className="text-sm text-[#8A8278]">Categoría activa (visible en la tienda)</span>
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setEditing(null) }}
                  className="h-10 px-4 rounded-sm border border-[#2E2925] bg-transparent text-[11px] uppercase tracking-[0.15em] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[11px] uppercase tracking-[0.15em] font-normal disabled:opacity-50 hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {editing ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-sm bg-[#221E1A] border border-[#2E2925] animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-sm bg-[#2A2520] border border-[#2E2925] flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 text-[#8A8278]/20" strokeWidth={1} />
            </div>
            <p className="text-[#8A8278] text-[15px] font-medium mb-1">No hay categorías</p>
            <p className="text-[#8A8278]/40 text-[13px]">Creá tu primera categoría para organizar productos</p>
          </div>
        ) : (
          <div className="border border-[#2E2925] rounded-sm overflow-hidden divide-y divide-[#2E2925]">
            {parentCategories.map(cat => (
              <div key={cat.id}>
                {/* Parent category row */}
                <div className="flex items-center justify-between px-4 py-3 hover:bg-[#F0EAE0]/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-sm bg-[#2A2520] flex items-center justify-center flex-shrink-0 border border-[#2E2925]">
                      <FolderOpen className="w-4 h-4 text-[#C9A55A]/60" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#F0EAE0]">{cat.name}</span>
                        {!cat.active && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#F0EAE0]/5 text-[#8A8278]/50">Inactiva</span>
                        )}
                      </div>
                      <div className="text-xs text-[#8A8278]/40">/{cat.slug} · {cat._count?.products ?? 0} productos</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-sm text-[#8A8278]/40 hover:text-[#F0EAE0] hover:bg-[#F0EAE0]/[0.04] transition-all"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-1.5 rounded-sm text-[#8A8278]/30 hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {categories
                  .filter(c => c.parentId === cat.id)
                  .map(sub => (
                    <div key={sub.id} className="flex items-center justify-between pl-10 pr-4 py-2.5 bg-[#161310] border-t border-[#2E2925]/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight className="w-3 h-3 text-[#8A8278]/15 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm text-[#F0EAE0]/50">{sub.name}</span>
                        {!sub.active && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#F0EAE0]/5 text-[#8A8278]/50">Inactiva</span>
                        )}
                        <span className="text-xs text-[#8A8278]/20">({sub._count?.products ?? 0})</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(sub)}
                          className="p-1.5 rounded-sm text-[#8A8278]/40 hover:text-[#F0EAE0] hover:bg-[#F0EAE0]/[0.04] transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sub)}
                          className="p-1.5 rounded-sm text-[#8A8278]/30 hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
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
      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8278]/50 mb-1.5 block">{label}</label>
      <input
        required={required}
        className="w-full bg-[#2A2520] border border-[#2E2925] rounded-sm h-11 px-3 text-sm text-[#F0EAE0] placeholder-[#8A8278]/25 focus:outline-none focus:border-[#3D3830] transition-all"
        {...props}
        value={props.value ?? ''}
      />
    </div>
  )
}
