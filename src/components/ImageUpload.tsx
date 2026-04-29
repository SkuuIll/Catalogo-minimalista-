'use client'

import { useState, useRef } from 'react'
import { Upload, Link2, ImageIcon, X } from 'lucide-react'

export function ImageUpload({
  onUpload,
  defaultImage,
}: {
  onUpload: (url: string, path?: string) => void
  defaultImage?: string
}) {
  const [preview, setPreview] = useState(defaultImage || '')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        onUpload(data.url, data.filename)
      } else {
        alert(data.error || 'Error al subir')
      }
    } catch (e) {
      alert('Error de conexión al subir imagen')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const clearImage = () => {
    setPreview('')
    onUpload('', '')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
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
          Subir
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
          onClick={() => !preview && inputRef.current?.click()}
          className={`
            relative w-full h-52 sm:h-60 rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-all overflow-hidden
            ${dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-primary/40'}
            ${preview ? 'border-solid border-white/10' : ''}
          `}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                  className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                >
                  <Upload className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearImage() }}
                  className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-error/60 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragOver ? 'bg-primary/10' : 'bg-surface-container'}`}>
                <ImageIcon className={`w-5 h-5 ${dragOver ? 'text-primary' : 'text-on-surface-variant'}`} />
              </div>
              <span className="text-sm text-on-surface-variant font-medium">
                {loading ? 'Subiendo...' : 'Arrastra una imagen o haz clic'}
              </span>
              <span className="text-[11px] text-on-surface-variant/50">JPG, PNG, WEBP · Máx 5MB</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            defaultValue={defaultImage?.startsWith('http') ? defaultImage : ''}
            onChange={(e) => {
              if (e.target.value) {
                setPreview(e.target.value)
                onUpload(e.target.value)
              }
            }}
            className="block w-full bg-surface-container border border-white/5 rounded-lg py-3 px-4 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {preview && preview.startsWith('http') && (
            <div className="relative h-40 rounded-xl overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-error/60 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
