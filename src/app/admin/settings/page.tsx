'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SiteSettings {
  siteName: string
  siteTagline: string
  heroTitle: string
  heroSubtitle: string
  primaryColor: string
  showCategories: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Aura',
    siteTagline: 'Minimalist',
    heroTitle: 'Curaduría de Objetos Esenciales',
    heroSubtitle: 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno.',
    primaryColor: '#d4a853',
    showCategories: true,
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            siteName: data.siteName || 'Aura',
            siteTagline: data.siteTagline || 'Minimalist',
            heroTitle: data.heroTitle || '',
            heroSubtitle: data.heroSubtitle || '',
            primaryColor: data.primaryColor || '#d4a853',
            showCategories: data.showCategories ?? true,
          })
        }
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        alert('Configuración guardada')
        router.refresh()
      } else {
        alert('Error al guardar')
      }
    } catch (e) {
      alert('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">Cargando...</div>

  return (
    <div className="min-h-screen bg-background text-on-surface py-8 sm:py-12 px-4 sm:px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-on-surface">Configuración</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Personaliza la apariencia y contenido del catálogo</p>
          </div>
          <Link href="/admin" className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
            ← Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identidad */}
          <div className="glass p-5 sm:p-6 rounded-xl border border-white/5">
            <h2 className="font-serif text-lg mb-4 text-primary">Identidad del Sitio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Nombre del Sitio</label>
                <input
                  value={settings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Tagline</label>
                <input
                  value={settings.siteTagline}
                  onChange={e => setSettings({ ...settings, siteTagline: e.target.value })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Color Principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <input
                    value={settings.primaryColor}
                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="showCategories"
                  checked={settings.showCategories}
                  onChange={e => setSettings({ ...settings, showCategories: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                />
                <label htmlFor="showCategories" className="text-sm text-on-surface">Mostrar filtros de categoría</label>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="glass p-5 sm:p-6 rounded-xl border border-white/5">
            <h2 className="font-serif text-lg mb-4 text-primary">Sección Hero</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Título Principal</label>
                <input
                  value={settings.heroTitle}
                  onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1.5">Subtítulo / Descripción</label>
                <textarea
                  rows={3}
                  value={settings.heroSubtitle}
                  onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary rounded-xl text-sm font-semibold tracking-wide hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
