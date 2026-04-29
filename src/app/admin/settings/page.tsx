'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Settings, Palette, Type, Eye, Loader2,
  Check, Globe, Paintbrush, KeyRound, Sparkles
} from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteTagline: string
  heroTitle: string
  heroSubtitle: string
  primaryColor: string
  showCategories: boolean
  geminiApiKey: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Aura',
    siteTagline: 'Minimalist',
    heroTitle: 'Curaduría de Objetos Esenciales',
    heroSubtitle: 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno.',
    primaryColor: '#d4a853',
    showCategories: true,
    geminiApiKey: '',
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
            geminiApiKey: data.geminiApiKey || '',
          })
        }
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

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex items-center h-14">
            <Link href="/admin" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors mr-4">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <h1 className="font-serif text-base sm:text-lg font-medium text-on-surface">Configuración</h1>
          </div>
        </div>
      </header>

      <div className="h-14" />

      <main className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-16">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identidad */}
          <div className="glass p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-serif text-base text-on-surface">Identidad del Sitio</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Type className="w-3 h-3" /> Nombre del Sitio
                </label>
                <input
                  value={settings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Type className="w-3 h-3" /> Tagline
                </label>
                <input
                  value={settings.siteTagline}
                  onChange={e => setSettings({ ...settings, siteTagline: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Palette className="w-3 h-3" /> Color Principal
                </label>
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
                    className="flex-1 bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface font-mono focus:outline-none focus:border-primary/40 transition-all"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-surface-container/50 border border-white/[0.04]">
                <input
                  type="checkbox"
                  id="showCategories"
                  checked={settings.showCategories}
                  onChange={e => setSettings({ ...settings, showCategories: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                />
                <label htmlFor="showCategories" className="text-sm text-on-surface flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-on-surface-variant/50" />
                  Mostrar filtros de categoría en el catálogo
                </label>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="glass p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Paintbrush className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-serif text-base text-on-surface">Sección Hero</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Type className="w-3 h-3" /> Título Principal
                </label>
                <input
                  value={settings.heroTitle}
                  onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                  <Type className="w-3 h-3" /> Subtítulo
                </label>
                <textarea
                  rows={3}
                  value={settings.heroSubtitle}
                  onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface resize-none focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Gemini AI */}
          <div className="glass p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-serif text-base text-on-surface">Inteligencia Artificial</h2>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60 mb-2">
                <KeyRound className="w-3 h-3" /> API Key de Google Gemini
              </label>
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-all font-mono"
              />
              <p className="text-[11px] text-on-surface-variant/40 mt-2">
                Obtén tu API key en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>. Se usa para generar especificaciones de productos automáticamente.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
