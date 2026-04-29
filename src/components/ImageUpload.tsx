'use client'

import { useState, useRef } from 'react'
import { Upload, Link2, ImageIcon, X, Images, Loader2 } from 'lucide-react'

export function ImageUpload({
  onUpload,
  defaultImages = [],
  multiple = true,
}: {
  onUpload: (urls: string[]) => void
  defaultImages?: string[]
  multiple?: boolean
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(defaultImages.filter(Boolean))
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) return false
      if (file.size > 5 * 1024 * 1024) return false
      return true
    })

    if (validFiles.length === 0) {
      alert('Solo imágenes JPG/PNG/WEBP, máx 5MB')
      return
    }

    setLoading(true)
    const newUrls: string[] = []

    for (const file of validFiles) {
      // Preview local inmediato
      const localUrl = URL.createObjectURL(file)
      newUrls.push(localUrl)
    }
    setPreviewUrls(prev => multiple ? [...prev, ...newUrls] : newUrls)

    // Subir al servidor
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (data.success) {
          const uploadedUrl = data.url
          newUrls[i] = uploadedUrl
          setPreviewUrls(prev => {
            const copy = [...prev]
            const idx = copy.indexOf(URL.createObjectURL(file))
            if (idx >= 0) copy[idx] = uploadedUrl
            return copy
          })
        }
      } catch (e) {
        console.error('Upload error:', e)
      }
    }

    // Notificar con todas las URLs finales (las que se subieron + las previas)
    setPreviewUrls(prev => {
      const all = [...prev]
      onUpload(all.filter(u => !u.startsWith('blob:')))
      return all
    })

    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    setPreviewUrls(prev => {
      const next = prev.filter((_, i) => i !== index)
      onUpload(next.filter(u => !u.startsWith('blob:')))
      return next
    })
  }

  const addUrlImage = () => {
    if (!urlInput.trim()) return
    setPreviewUrls(prev => {
      const next = multiple ? [...prev, urlInput.trim()] : [urlInput.trim()]
      onUpload(next)
      return next
    })
    setUrlInput('')
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previewUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container ring-1 ring-white/[0.04] group">
              <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-error/80 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
              {url.startsWith('blob:') && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === 'upload' ? 'bg-background text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Subir {multiple && <span className="text-[10px] opacity-60">(múltiple)</span>}
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === 'url' ? 'bg-background text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            relative w-full h-40 sm:h-48 rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-all overflow-hidden
            ${dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/40'}
          `}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dragOver ? 'bg-primary/10' : 'bg-surface-container'}`}>
            {loading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Images className={`w-5 h-5 ${dragOver ? 'text-primary' : 'text-on-surface-variant'}`} />
            )}
          </div>
          <span className="text-sm text-on-surface-variant font-medium">
            {loading ? 'Subiendo...' : multiple ? 'Arrastra imágenes o haz clic' : 'Arrastra una imagen o haz clic'}
          </span>
          <span className="text-[11px] text-on-surface-variant/50">JPG, PNG, WEBP · Máx 5MB cada una</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrlImage())}
              className="flex-1 bg-surface-container border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/40 transition-all"
            />
            <button
              type="button"
              onClick={addUrlImage}
              className="px-4 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
