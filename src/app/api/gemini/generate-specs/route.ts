import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { productName, description, category } = await request.json()

    const { prisma } = await import('@/lib/prisma')
    const settings = await prisma.siteSettings.findFirst()
    const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'No hay API key de Gemini configurada' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Genera un JSON con especificaciones técnicas para el producto "${productName}".
Descripción: ${description}
Categoría: ${category || 'General'}

Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto (sin markdown, sin explicaciones):
{
  "specifications": [
    {"key": "Marca", "value": "..."},
    {"key": "Modelo", "value": "..."},
    {"key": "Material", "value": "..."},
    {"key": "Dimensiones", "value": "..."},
    {"key": "Peso", "value": "..."},
    {"key": "Garantía", "value": "..."}
  ]
}

Incluye entre 6 y 10 especificaciones relevantes para esta categoría de producto. Los valores deben ser realistas y concisos.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No se pudo parsear la respuesta de la IA' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Gemini error:', error)
    return NextResponse.json({ error: error.message || 'Error generando especificaciones' }, { status: 500 })
  }
}
