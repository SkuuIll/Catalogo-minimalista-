import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, resolve } from 'path'
import { verifyAuth } from '@/lib/auth-helper'

// Use an absolute path anchored to this file's location to avoid
// cwd() issues when running behind PM2 or in non-standard working dirs
const getUploadDir = () => {
  // __dirname is not available in ESM-style Next.js route files,
  // so we use process.cwd() but verify/log the resolved path
  const dir = resolve(process.cwd(), 'public', 'uploads')
  return dir
}

export async function POST(request: Request) {
  const authed = await verifyAuth(request)
  if (!authed) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const formData = await request.formData()
    const uploadDir = getUploadDir()

    // Always ensure directory exists
    await mkdir(uploadDir, { recursive: true })

    let files: File[] = []

    const filesField = formData.getAll('files')
    if (filesField.length > 0) {
      files = filesField as File[]
    } else {
      const singleFile = formData.get('file') as File | null
      if (singleFile) files = [singleFile]
    }

    if (!files.length) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const results: { success?: boolean; error?: string; url?: string; filename?: string }[] = []

    for (const file of files) {
      // Validate type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
      if (!allowedTypes.includes(file.type)) {
        results.push({ error: `Tipo no permitido: ${file.type}`, filename: file.name })
        continue
      }

      // 8 MB limit per file (increased from 5 MB)
      if (file.size > 8 * 1024 * 1024) {
        results.push({ error: `Excede 8MB: ${Math.round(file.size / 1024 / 1024)}MB`, filename: file.name })
        continue
      }

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Strip dangerous chars from extension
        const rawExt = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
        const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(rawExt) ? rawExt : 'jpg'

        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
        const filePath = join(uploadDir, filename)

        await writeFile(filePath, buffer)

        results.push({ success: true, url: `/api/uploads/${filename}`, filename })
      } catch (fileErr) {
        console.error('Error writing file:', file.name, fileErr)
        results.push({ error: 'Error al guardar el archivo', filename: file.name })
      }
    }

    const successful = results.filter(r => r.success)

    if (successful.length === 0) {
      return NextResponse.json(
        { success: false, error: results[0]?.error || 'Error al subir imágenes', results },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: successful[0]?.url,
      urls: successful.map(r => r.url),
      results,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error interno al subir imágenes', detail: String(error) },
      { status: 500 }
    )
  }
}
