'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2, Eye, EyeOff, Globe, MessageCircle, Cpu, Image as ImageIcon, Palette } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { useToast } from '@/components/Toast'

const defaults = {
  siteName: 'Aura',
  siteTagline: 'Catálogo Premium',
  siteDescription: '',
  heroTitle: '',
  heroSubtitle: '',
  primaryColor: '#bf9b4e',
  logoUrl: '',
  faviconUrl: '',
  showCategories: true,
  geminiApiKey: '',
  whatsappNumber: '',
  whatsappMessage: 'Hola, quiero información sobre:',
}

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(defaults)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d?.id) {
          setSettings({
            siteName: d.siteName || defaults.siteName,
            siteTagline: d.siteTagline || '',
            siteDescription: d.siteDescription || '',
            heroTitle: d.heroTitle || '',
            heroSubtitle: d.heroSubtitle || '',
            primaryColor: d.primaryColor || defaults.primaryColor,
            logoUrl: d.logoUrl || '',
            faviconUrl: d.faviconUrl || '',
            showCategories: d.showCategories ?? true,
            geminiApiKey: d.geminiApiKey || '',
            whatsappNumber: d.whatsappNumber || '',
            whatsappMessage: d.whatsappMessage || defaults.whatsappMessage,
          })
        }
      })
      .catch(() => showToast('Error al cargar configuración', 'error'))
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
        showToast('Configuración guardada', 'success')
        router.refresh()
      } else {
        showToast('Error al guardar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof typeof defaults>(key: K, value: typeof defaults[K]) =>
    setSettings(s => ({ ...s, [key]: value }))

  return (
    <div className="min-h-screen bg-[#060606]">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1a1a1a]">
        <div className="flex items-center h-12 px-4 gap-3">
          <Link href="/admin" className="p-1.5 -ml-1 text-white/30 hover:text-white/60 transition-colors rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-serif text-sm font-medium text-white">Configuración</h1>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-xl mx-auto py-6 px-4 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Site identity */}
          <SettingsSection title="Identidad del sitio" icon={<Globe className="w-3.5 h-3.5" />}>
            <div className="grid sm:grid-cols-2 gap-3">
              <SettingsInput
                label="Nombre del sitio"
                value={settings.siteName}
                onChange={e => set('siteName', e.target.value)}
              />
              <SettingsInput
                label="Tagline"
                value={settings.siteTagline}
                onChange={e => set('siteTagline', e.target.value)}
                placeholder="Catálogo Premium"
              />
            </div>
            <SettingsTextarea
              label="Descripción del sitio (SEO)"
              value={settings.siteDescription}
              onChange={e => set('siteDescription', e.target.value)}
              placeholder="Catálogo minimalista de productos premium…"
            />
          </SettingsSection>

          {/* Branding */}
          <SettingsSection title="Marca y color" icon={<Palette className="w-3.5 h-3.5" />}>
            <div>
              <label className="settings-label">Color de acento</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[#1a1a1a] bg-transparent cursor-pointer"
                />
                <input
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="settings-input flex-1 font-mono"
                  placeholder="#bf9b4e"
                />
              </div>
            </div>

            <SettingsInput
              label="URL del Favicon"
              value={settings.faviconUrl}
              onChange={e => set('faviconUrl', e.target.value)}
              placeholder="https://…/favicon.ico"
            />
          </SettingsSection>

          {/* Logo */}
          <SettingsSection title="Logo" icon={<ImageIcon className="w-3.5 h-3.5" />}>
            <div>
              <label className="settings-label">Logo del sitio</label>
              <ImageUpload
                onUpload={urls => set('logoUrl', urls[0] || '')}
                defaultImages={settings.logoUrl ? [settings.logoUrl] : []}
                multiple={false}
              />
            </div>
          </SettingsSection>

          {/* Hero */}
          <SettingsSection title="Hero / Portada" icon={<Globe className="w-3.5 h-3.5" />}>
            <SettingsInput
              label="Título principal"
              value={settings.heroTitle}
              onChange={e => set('heroTitle', e.target.value)}
              placeholder="Productos que importan"
            />
            <SettingsTextarea
              label="Subtítulo"
              value={settings.heroSubtitle}
              onChange={e => set('heroSubtitle', e.target.value)}
              placeholder="Selección curada de tecnología, audio y más…"
              rows={2}
            />
          </SettingsSection>

          {/* WhatsApp */}
          <SettingsSection title="WhatsApp" icon={<MessageCircle className="w-3.5 h-3.5" />}>
            <SettingsInput
              label="Número (con código de país)"
              value={settings.whatsappNumber}
              onChange={e => set('whatsappNumber', e.target.value)}
              placeholder="+5491112345678"
              type="tel"
            />
            <SettingsTextarea
              label="Mensaje predeterminado"
              value={settings.whatsappMessage}
              onChange={e => set('whatsappMessage', e.target.value)}
              rows={2}
            />
            {settings.whatsappNumber && (
              <div className="flex items-center gap-2 text-xs text-white/30 bg-[#0d0d0d] rounded-xl p-3 border border-[#1a1a1a]">
                <MessageCircle className="w-3 h-3 text-[#3cb371]/60 flex-shrink-0" />
                <span>WhatsApp configurado: <span className="text-white/50">{settings.whatsappNumber}</span></span>
              </div>
            )}
          </SettingsSection>

          {/* AI */}
          <SettingsSection title="Inteligencia Artificial" icon={<Cpu className="w-3.5 h-3.5" />}>
            <div>
              <label className="settings-label">Google Gemini API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={e => set('geminiApiKey', e.target.value)}
                  placeholder="AIzaSy…"
                  className="settings-input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-white/20 mt-1.5">
                Permite generar especificaciones con IA.{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#bf9b4e]/60 hover:text-[#bf9b4e] transition-colors"
                >
                  Obtener key en Google AI Studio
                </a>
              </p>
            </div>
          </SettingsSection>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/admin"
              className="h-11 px-6 rounded-xl bg-[#111] border border-[#1a1a1a] text-sm text-white/60 hover:text-white hover:border-white/10 transition-all flex items-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .settings-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgb(255 255 255 / 0.30);
          margin-bottom: 6px;
        }
        .settings-input {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          height: 44px;
          padding: 0 12px;
          font-size: 14px;
          color: white;
          outline: none;
          transition: border-color 0.15s;
        }
        .settings-input:focus {
          border-color: rgb(191 155 78 / 0.30);
        }
        .settings-input::placeholder {
          color: rgb(255 255 255 / 0.15);
        }
      `}</style>
    </div>
  )
}

function SettingsSection({
  title, icon, children,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#bf9b4e]/50">{icon}</span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function SettingsInput({
  label, ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="settings-label">{label}</label>
      <input className="settings-input w-full" {...props} />
    </div>
  )
}

function SettingsTextarea({
  label, rows = 3, ...props
}: { label: string; rows?: number } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="settings-label">{label}</label>
      <textarea
        rows={rows}
        className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl p-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#bf9b4e]/30 transition-all resize-none"
        {...props}
      />
    </div>
  )
}
