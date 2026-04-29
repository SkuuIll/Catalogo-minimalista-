import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { stat } from 'fs/promises'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Security: block path traversal, null bytes, hidden files
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.startsWith('.') ||
      filename.includes('\0')
    ) {
      return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 })
    }

    const uploadDir = resolve(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    const statInfo = await stat(filePath)
    const fileSize = statInfo.size

    // Determine content type from extension
    const ext = filename.split('.').pop()?.toLowerCase()
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml',
    }
    const contentType = contentTypes[ext || ''] || 'application/octet-stream'

    // Read file and return with proper caching headers
    const { readFile } = await import('fs/promises')
    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error) {
    console.error('Upload serve error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}