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
      .catch(() => showToast('Error loading settings', 'error'))
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
        showToast('Settings saved', 'success')
        router.refresh()
      } else {
        showToast('Error saving', 'error')
      }
    } catch {
      showToast('Connection error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof typeof defaults>(key: K, value: typeof defaults[K]) =>
    setSettings(s => ({ ...s, [key]: value }))

  return (
    <div className="min-h-screen bg-[--bg]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[--bg]/95 backdrop-blur-xl border-b border-[--border]">
        <div className="flex items-center h-16 px-6 gap-4 max-w-7xl mx-auto">
          <Link href="/admin" className="p-2 -ml-2 text-[--text-secondary] hover:text-[--text] transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          </Link>
          <h1 className="font-serif text-lg font-light text-[--text] tracking-[0.1em]">SETTINGS</h1>
        </div>
      </header>

      <div className="h-16" />

      <main className="max-w-xl mx-auto py-8 px-6 pb-12">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Site identity */}
          <SettingsSection title="SITE IDENTITY" icon={<Globe className="w-4 h-4" strokeWidth={1} />}>
            <div className="grid sm:grid-cols-2 gap-4">
              <SettingsInput
                label="SITE NAME"
                value={settings.siteName}
                onChange={e => set('siteName', e.target.value)}
              />
              <SettingsInput
                label="TAGLINE"
                value={settings.siteTagline}
                onChange={e => set('siteTagline', e.target.value)}
                placeholder="PREMIUM CATALOG"
              />
            </div>
            <SettingsTextarea
              label="SITE DESCRIPTION (SEO)"
              value={settings.siteDescription}
              onChange={e => set('siteDescription', e.target.value)}
              placeholder="Minimalist catalog of premium products…"
            />
          </SettingsSection>

          {/* Branding */}
          <SettingsSection title="BRANDING & COLOR" icon={<Palette className="w-4 h-4" strokeWidth={1} />}>
            <div>
              <label className="settings-label">ACCENT COLOR</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="w-11 h-11 rounded-none border border-[--border] bg-[--bg] cursor-pointer"
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
              label="FAVICON URL"
              value={settings.faviconUrl}
              onChange={e => set('faviconUrl', e.target.value)}
              placeholder="https://…/favicon.ico"
            />
          </SettingsSection>

          {/* Logo */}
          <SettingsSection title="LOGO" icon={<ImageIcon className="w-4 h-4" strokeWidth={1} />}>
            <div>
              <label className="settings-label">SITE LOGO</label>
              <ImageUpload
                onUpload={urls => set('logoUrl', urls[0] || '')}
                defaultImages={settings.logoUrl ? [settings.logoUrl] : []}
                multiple={false}
              />
            </div>
          </SettingsSection>

          {/* Hero */}
          <SettingsSection title="HERO / COVER" icon={<Globe className="w-4 h-4" strokeWidth={1} />}>
            <SettingsInput
              label="MAIN TITLE"
              value={settings.heroTitle}
              onChange={e => set('heroTitle', e.target.value)}
              placeholder="Products that matter"
            />
            <SettingsTextarea
              label="SUBTITLE"
              value={settings.heroSubtitle}
              onChange={e => set('heroSubtitle', e.target.value)}
              placeholder="Curated selection of technology, audio and more…"
              rows={2}
            />
          </SettingsSection>

          {/* WhatsApp */}
          <SettingsSection title="WHATSAPP" icon={<MessageCircle className="w-4 h-4" strokeWidth={1} />}>
            <SettingsInput
              label="NUMBER (WITH COUNTRY CODE)"
              value={settings.whatsappNumber}
              onChange={e => set('whatsappNumber', e.target.value)}
              placeholder="+5491112345678"
              type="tel"
            />
            <SettingsTextarea
              label="DEFAULT MESSAGE"
              value={settings.whatsappMessage}
              onChange={e => set('whatsappMessage', e.target.value)}
              rows={2}
            />
            {settings.whatsappNumber && (
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[--text-secondary] bg-[--bg-surface] rounded-none p-3 border border-[--border]">
                <MessageCircle className="w-3.5 h-3.5 text-[--green]/60 flex-shrink-0" strokeWidth={1} />
                <span>WHATSAPP CONFIGURED: <span className="text-[--text]/70">{settings.whatsappNumber}</span></span>
              </div>
            )}
          </SettingsSection>

          {/* AI */}
          <SettingsSection title="ARTIFICIAL INTELLIGENCE" icon={<Cpu className="w-4 h-4" strokeWidth={1} />}>
            <div>
              <label className="settings-label">GOOGLE GEMINI API KEY</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-secondary] hover:text-[--text] transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" strokeWidth={1} /> : <Eye className="w-4 h-4" strokeWidth={1} />}
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[--text-tertiary] mt-2">
                ENABLES AI-GENERATED SPECIFICATIONS.{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[--accent] hover:text-[--text] transition-colors"
                >
                  GET KEY FROM GOOGLE AI STUDIO
                </a>
              </p>
            </div>
          </SettingsSection>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/admin"
              className="h-11 px-6 rounded-none bg-[--bg] border border-[--border] text-[12px] uppercase tracking-[0.15em] text-[--text-secondary] hover:text-[--text] hover:border-[--border] transition-all flex items-center"
            >
              CANCEL
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-none border border-[--accent] bg-transparent text-[--accent] text-[9px] uppercase tracking-[0.25em] font-normal hover:bg-[--accent] hover:text-[--bg] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.5} />}
              {saving ? 'SAVING…' : 'SAVE SETTINGS'}
            </button>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .settings-label {
          display: block;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: rgb(102 102 102);
          margin-bottom: 8px;
        }
        .settings-input {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 0;
          height: 44px;
          padding: 0 12px;
          font-size: 13px;
          color: #e8e8e8;
          outline: none;
          transition: border-color 0.15s;
        }
        .settings-input:focus {
          border-color: rgb(102 102 102);
        }
        .settings-input::placeholder {
          color: rgb(68 68 68);
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
    <div className="bg-[--bg-surface] border border-[--border] rounded-none p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[--accent]/50">{icon}</span>
        <h2 className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[--text-secondary]">{title}</h2>
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
        className="w-full bg-[--bg] border border-[--border] rounded-none p-3 text-[13px] text-[--text] placeholder-[#444] focus:outline-none focus:border-[--border] transition-all resize-none"
        {...props}
      />
    </div>
  )
}
