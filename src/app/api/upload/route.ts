import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const results = []
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        results.push({ error: 'Tipo no permitido', filename: file.name })
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        results.push({ error: 'Excede 5MB', filename: file.name })
        continue
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
      const filePath = join(uploadDir, filename)
      await writeFile(filePath, buffer)
      results.push({ success: true, url: `/uploads/${filename}`, filename })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir imágenes' }, { status: 500 })
  }
}
