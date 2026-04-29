'use client'

import { useState, useRef } from 'react'
import { Upload, Link2, X, Images, Loader2 } from 'lucide-react'
import { useToast } from './Toast'

export function ImageUpload({
  onUpload,
  defaultImages = [],
  multiple = true,
}: {
  onUpload: (urls: string[]) => void
  defaultImages?: string[]
  multiple?: boolean
}) {
  const { showToast } = useToast()
  const [previewUrls, setPreviewUrls] = useState<string[]>(defaultImages.filter(Boolean))
  const [uploading, setUploading] = useState<Set<number>>(new Set())
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File, index: number) => {
    setUploading(prev => new Set(prev).add(index))
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (data.success && data.url) {
        setPreviewUrls(prev => {
          const copy = [...prev]
          copy[index] = data.url
          onUpload(copy.filter(u => !u.startsWith('blob:')))
          return copy
        })
      } else {
        showToast(data.error || 'Error al subir', 'error')
      }
    } catch (err) {
      showToast('Error de conexión', 'error')
    }
    setUploading(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const validFiles = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) return false
      if (f.size > 5 * 1024 * 1024) return false
      return true
    })
    if (!validFiles.length) { showToast('Solo JPG/PNG/WEBP, máx 5MB', 'error'); return }

    const startIdx = previewUrls.length
    const localUrls = validFiles.map(f => URL.createObjectURL(f))
    setPreviewUrls(prev => multiple ? [...prev, ...localUrls] : localUrls)

    for (let i = 0; i < validFiles.length; i++) {
      const idx = startIdx + i
      uploadFile(validFiles[i], idx)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }

  const removeImage = (index: number) => {
    const urlToRemove = previewUrls[index]
    if (urlToRemove && !urlToRemove.startsWith('blob:')) {
      // Optionally notify server to delete file
    }
    setPreviewUrls(prev => {
      const next = prev.filter((_, i) => i !== index)
      onUpload(next.filter(u => !u.startsWith('blob:')))
      return next
    })
  }

  const addUrlImage = () => {
    if (!urlInput.trim()) return
    const newUrl = urlInput.trim()
    setPreviewUrls(prev => {
      const next = multiple ? [...prev, newUrl] : [newUrl]
      onUpload(next)
      return next
    })
    setUrlInput('')
  }

  return (
    <div className="space-y-3">
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previewUrls.map((url, index) => {
            const isBlob = url.startsWith('blob:')
            const isLoading = uploading.has(index)
            return (
              <div key={`${url}-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-[#111] border border-[#1a1a1a]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {(isBlob || isLoading) && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="text-[10px] text-white/60">Subiendo</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-[#e05555] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white/60 font-medium">
                  {index + 1}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-1 p-1 bg-[#111] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-[#060606] text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          <Upload className="w-3.5 h-3.5" /> Subir
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'url' ? 'bg-[#060606] text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          <Link2 className="w-3.5 h-3.5" /> URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative w-full h-36 sm:h-44 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${dragOver ? 'border-[#bf9b4e] bg-[#bf9b4e]/5' : 'border-[#1a1a1a] hover:border-white/10'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dragOver ? 'bg-[#bf9b4e]/10' : 'bg-[#111]'}`}>
            <Images className={`w-5 h-5 ${dragOver ? 'text-[#bf9b4e]' : 'text-white/30'}`} />
          </div>
          <span className="text-sm text-white/40 font-medium">
            {multiple ? 'Arrastrá imágenes o hacé clic' : 'Arrastrá una imagen o hacé clic'}
          </span>
          <span className="text-[11px] text-white/20">JPG, PNG, WEBP · Máx 5MB</span>
          <input ref={inputRef} type="file" accept="image/*" multiple={multiple} onChange={handleChange} className="hidden" />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrlImage())}
            className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white placeholder-white/15 focus:outline-none focus:border-white/10 transition-all"
          />
          <button type="button" onClick={addUrlImage} className="px-4 h-11 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-[0.98] transition-all">
            Agregar
          </button>
        </div>
      )}
    </div>
  )
}