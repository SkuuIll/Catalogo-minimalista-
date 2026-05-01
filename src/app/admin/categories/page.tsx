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
      showToast('Error loading categories', 'error')
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
      if (!res.ok) throw new Error(data.error || 'Error saving')
      setFormOpen(false)
      setEditing(null)
      setFormData(defaultForm)
      showToast(editing ? 'Category updated' : 'Category created', 'success')
      fetchCategories()
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error saving', 'error')
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
        showToast('Category deleted', 'success')
        fetchCategories()
        router.refresh()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error deleting', 'error')
      }
    } catch {
      showToast('Connection error', 'error')
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="flex items-center h-16 px-6 gap-4 max-w-7xl mx-auto">
          <Link href="/admin" className="p-2 -ml-2 text-[#666] hover:text-[#e8e8e8] transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          </Link>
          <h1 className="font-serif text-lg font-light text-[#e8e8e8] tracking-[0.1em]">CATEGORIES</h1>
          <span className="ml-auto text-[9px] uppercase tracking-[0.25em] text-[#666]">{categories.length} CATEGORIES</span>
        </div>
      </header>

      <div className="h-16" />

      <main className="max-w-3xl mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={formOpen && !editing ? () => setFormOpen(false) : openNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-none border border-[#c9a55a] bg-transparent text-[#c9a55a] text-[9px] uppercase tracking-[0.25em] font-normal hover:bg-[#c9a55a] hover:text-[#0a0a0a] active:scale-[0.98] transition-all duration-300"
          >
            {formOpen && !editing ? <X className="w-4 h-4" strokeWidth={1} /> : <Plus className="w-4 h-4" strokeWidth={1} />}
            {formOpen && !editing ? 'CANCEL' : 'NEW CATEGORY'}
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-none p-6 mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-serif font-light text-[#e8e8e8] flex items-center gap-2 tracking-[0.1em]">
                <FolderOpen className="w-4 h-4 text-[#c9a55a]" strokeWidth={1} />
                {editing ? `EDITING: ${editing.name}` : 'NEW CATEGORY'}
              </h3>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setEditing(null) }}
                className="p-1 text-[#666] hover:text-[#e8e8e8] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="NAME *"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <FormInput
                label="SLUG"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated"
              />
              <FormInput
                label="ORDER"
                type="number"
                value={String(formData.order)}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <FormInput
                label="ICON (Lucide name)"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                placeholder="laptop, watch, shirt…"
              />

              <div className="sm:col-span-2">
                <label className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666] mb-2 block">
                  PARENT CATEGORY
                </label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-none h-11 px-3 text-[13px] uppercase tracking-[0.15em] text-[#e8e8e8] focus:outline-none focus:border-[#2a2a2a] transition-all appearance-none"
                >
                  <option value="">NONE (MAIN CATEGORY)</option>
                  {parentCategories
                    .filter(c => c.id !== editing?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 p-3 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] cursor-pointer hover:border-[#2a2a2a] transition-all">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded-none accent-[#c9a55a]"
                  />
                  <span className="text-[12px] uppercase tracking-[0.15em] text-[#666]">ACTIVE (VISIBLE IN STORE)</span>
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setEditing(null) }}
                  className="h-10 px-5 rounded-none border border-[#1a1a1a] bg-transparent text-[8px] uppercase tracking-[0.25em] text-[#666] hover:text-[#e8e8e8] hover:border-[#2a2a2a] transition-all duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-none border border-[#c9a55a] bg-transparent text-[#c9a55a] text-[8px] uppercase tracking-[0.25em] font-normal disabled:opacity-50 hover:bg-[#c9a55a] hover:text-[#0a0a0a] active:scale-[0.98] transition-all duration-300"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? 'SAVE CHANGES' : 'CREATE CATEGORY'}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-none bg-[#0f0f0f] border border-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
              <FolderOpen className="w-7 h-7 text-[#222]" strokeWidth={1} />
            </div>
            <p className="text-[#666] text-[13px] uppercase tracking-[0.2em] mb-1">NO CATEGORIES</p>
            <p className="text-[#444] text-[11px] uppercase tracking-[0.15em]">CREATE YOUR FIRST CATEGORY TO ORGANIZE PIECES</p>
          </div>
        ) : (
          <div className="border border-[#1a1a1a] rounded-none overflow-hidden divide-y divide-[#1a1a1a]">
            {parentCategories.map(cat => (
              <div key={cat.id}>
                {/* Parent category row */}
                <div className="flex items-center justify-between px-5 py-4 hover:bg-[#141414] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-none bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 border border-[#1a1a1a]">
                      <FolderOpen className="w-4 h-4 text-[#c9a55a]/60" strokeWidth={1} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-serif font-light text-[#e8e8e8] tracking-[0.05em]">{cat.name}</span>
                        {!cat.active && (
                          <span className="text-[8px] px-2 py-0.5 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] text-[#666] uppercase tracking-[0.2em]">INACTIVE</span>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[#666] mt-0.5">/{cat.slug} · {cat._count?.products ?? 0} PIECES</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 rounded-none text-[#666] hover:text-[#e8e8e8] hover:bg-[#141414] transition-all"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-2 rounded-none text-[#666] hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1} />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {categories
                  .filter(c => c.parentId === cat.id)
                  .map(sub => (
                    <div key={sub.id} className="flex items-center justify-between pl-12 pr-5 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a]">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight className="w-3 h-3 text-[#444] flex-shrink-0" strokeWidth={1} />
                        <span className="text-[12px] font-serif font-light text-[#e8e8e8]/60 tracking-[0.05em]">{sub.name}</span>
                        {!sub.active && (
                          <span className="text-[8px] px-2 py-0.5 rounded-none bg-[#0a0a0a] border border-[#1a1a1a] text-[#666] uppercase tracking-[0.2em]">INACTIVE</span>
                        )}
                        <span className="text-[10px] uppercase tracking-[0.15em] text-[#444]">({sub._count?.products ?? 0})</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(sub)}
                          className="p-2 rounded-none text-[#666] hover:text-[#e8e8e8] hover:bg-[#141414] transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sub)}
                          className="p-2 rounded-none text-[#666] hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1} />
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
      <label className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#666] mb-2 block">{label}</label>
      <input
        required={required}
        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-none h-11 px-3 text-[13px] uppercase tracking-[0.15em] text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#2a2a2a] transition-all"
        {...props}
        value={props.value ?? ''}
      />
    </div>
  )
}
