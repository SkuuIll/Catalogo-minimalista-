'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'Aura', siteTagline: 'Minimalist', heroTitle: '', heroSubtitle: '',
    primaryColor: '#bf9b4e', showCategories: true, geminiApiKey: '', whatsappNumber: '', whatsappMessage: 'Hola, quiero información sobre:',
  })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d && !d.error) setSettings({
        siteName: d.siteName || 'Aura', siteTagline: d.siteTagline || '', heroTitle: d.heroTitle || '',
        heroSubtitle: d.heroSubtitle || '', primaryColor: d.primaryColor || '#bf9b4e',
        showCategories: d.showCategories ?? true, geminiApiKey: d.geminiApiKey || '',
        whatsappNumber: d.whatsappNumber || '', whatsappMessage: d.whatsappMessage || 'Hola, quiero información sobre:',
      })
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
      router.refresh()
    } catch { alert('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-[#060606]">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center h-11 px-4 gap-3">
          <Link href="/admin" className="p-1 -ml-1 text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <h1 className="font-serif text-sm font-medium text-white">Configuración</h1>
        </div>
      </header>

      <div className="h-11" />

      <main className="max-w-xl mx-auto py-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site */}
          <Section title="Sitio">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre" value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} />
              <Input label="Tagline" value={settings.siteTagline} onChange={e => setSettings({ ...settings, siteTagline: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">Color principal</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="w-10 h-10 rounded-xl border border-[#1a1a1a] bg-transparent cursor-pointer" />
                  <input value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white font-mono focus:outline-none focus:border-white/10 transition-all" />
                </div>
              </div>
            </div>
          </Section>

          {/* Hero */}
          <Section title="Hero">
            <Input label="Título" value={settings.heroTitle} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} />
            <Textarea label="Subtítulo" value={settings.heroSubtitle} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })} />
          </Section>

          {/* WhatsApp */}
          <Section title="WhatsApp">
            <Input label="Número (con código país)" value={settings.whatsappNumber} onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="+5491112345678" />
            <Input label="Mensaje" value={settings.whatsappMessage} onChange={e => setSettings({ ...settings, whatsappMessage: e.target.value })} />
          </Section>

          {/* Gemini */}
          <Section title="Gemini AI">
            <Input label="API Key" type="password" value={settings.geminiApiKey} onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })} placeholder="AIzaSy..." />
            <p className="text-[11px] text-white/15 mt-1">Obtén tu key en <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[#bf9b4e]/70 hover:text-[#bf9b4e] transition-colors">Google AI Studio</a></p>
          </Section>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Guardando' : 'Guardar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/25">{title}</h2>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white placeholder-white/10 focus:outline-none focus:border-white/10 transition-all"
      />
    </div>
  )
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-1.5 block">{label}</label>
      <textarea value={value} onChange={onChange} rows={3} className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl p-3 text-[13px] text-white placeholder-white/10 focus:outline-none focus:border-white/10 transition-all resize-none" />
    </div>
  )
}
