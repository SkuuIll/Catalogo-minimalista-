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
  primaryColor: '#C9A55A',
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
    <div className="min-h-screen bg-[#1A1714]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161310]/95 backdrop-blur-md border-b border-[#2E2925]/60">
        <div className="flex items-center h-12 px-4 gap-3 max-w-7xl mx-auto">
          <Link href="/admin" className="p-1.5 -ml-1 text-[#8A8278] hover:text-[#F0EAE0] transition-colors duration-300 rounded-sm">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <h1 className="font-serif text-sm font-light text-[#F0EAE0] tracking-[0.02em]">Configuración</h1>
        </div>
      </header>

      <div className="h-12" />

      <main className="max-w-xl mx-auto py-6 px-4 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Site identity */}
          <SettingsSection title="Identidad del sitio" icon={<Globe className="w-3.5 h-3.5" strokeWidth={1.5} />}>
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
          <SettingsSection title="Marca y color" icon={<Palette className="w-3.5 h-3.5" strokeWidth={1.5} />}>
            <div>
              <label className="settings-label">Color de acento</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-sm border border-[#2E2925] bg-transparent cursor-pointer"
                />
                <input
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="settings-input flex-1 font-mono"
                  placeholder="#C9A55A"
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
          <SettingsSection title="Logo" icon={<ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />}>
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
          <SettingsSection title="Hero / Portada" icon={<Globe className="w-3.5 h-3.5" strokeWidth={1.5} />}>
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
          <SettingsSection title="WhatsApp" icon={<MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />}>
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
              <div className="flex items-center gap-2 text-xs text-[#8A8278]/50 bg-[#221E1A] rounded-sm p-3 border border-[#2E2925]">
                <MessageCircle className="w-3 h-3 text-[#3cb371]/60 flex-shrink-0" strokeWidth={1.5} />
                <span>WhatsApp configurado: <span className="text-[#F0EAE0]/70">{settings.whatsappNumber}</span></span>
              </div>
            )}
          </SettingsSection>

          {/* AI */}
          <SettingsSection title="Inteligencia Artificial" icon={<Cpu className="w-3.5 h-3.5" strokeWidth={1.5} />}>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8278]/30 hover:text-[#8A8278] transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
              <p className="text-xs text-[#8A8278]/30 mt-1.5">
                Permite generar especificaciones con IA.{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C9A55A]/60 hover:text-[#C9A55A] transition-colors"
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
              className="h-11 px-6 rounded-sm bg-[#2A2520] border border-[#2E2925] text-[13px] text-[#8A8278] hover:text-[#F0EAE0] hover:border-[#3D3830] transition-all flex items-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-sm border border-[#C9A55A] bg-transparent text-[#C9A55A] text-[12px] uppercase tracking-[0.15em] font-normal hover:bg-[#C9A55A] hover:text-[#1A1714] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.5} />}
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
          color: rgb(138 130 120 / 0.50);
          margin-bottom: 6px;
        }
        .settings-input {
          background: #2A2520;
          border: 1px solid #2E2925;
          border-radius: 4px;
          height: 44px;
          padding: 0 12px;
          font-size: 14px;
          color: #F0EAE0;
          outline: none;
          transition: border-color 0.15s;
        }
        .settings-input:focus {
          border-color: rgb(201 165 90 / 0.30);
        }
        .settings-input::placeholder {
          color: rgb(138 130 120 / 0.25);
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
    <div className="bg-[#221E1A] border border-[#2E2925] rounded-sm p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#C9A55A]/50">{icon}</span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8A8278]/50">{title}</h2>
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
        className="w-full bg-[#2A2520] border border-[#2E2925] rounded-sm p-3 text-sm text-[#F0EAE0] placeholder-[#8A8278]/25 focus:outline-none focus:border-[#C9A55A]/30 transition-all resize-none"
        {...props}
      />
    </div>
  )
}
