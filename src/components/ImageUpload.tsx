'use client'

import { useState, useRef } from 'react'

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

    // Preview local
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

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`
          relative w-full h-48 sm:h-56 rounded-xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-2 transition-all overflow-hidden
          ${dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}
          ${preview ? 'border-solid border-white/10' : ''}
        `}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-sm text-white font-medium">Cambiar imagen</span>
            </div>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm text-on-surface-variant">
              {loading ? 'Subiendo...' : 'Arrastra una imagen o haz clic'}
            </span>
            <span className="text-xs text-on-surface-variant/50">JPG, PNG, WEBP · Máx 5MB</span>
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

      {/* Opción URL */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-on-surface-variant/50">o</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

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
        className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-sm text-on-surface transition-colors placeholder-on-surface-variant/50"
      />
    </div>
  )
}
