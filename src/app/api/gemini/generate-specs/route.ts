import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-helper'

export async function POST(request: Request) {
  const authed = await verifyAuth(request)
  if (!authed) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { productName, description, category } = await request.json()

    const { prisma } = await import('@/lib/prisma')
    const settings = await prisma.siteSettings.findFirst()
    const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'No hay API key de Gemini configurada. Ve a Configuración > Inteligencia Artificial.' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Actúa como un experto en productos de e-commerce. Genera especificaciones técnicas detalladas y realistas para el siguiente producto:

NOMBRE: "${productName}"
DESCRIPCIÓN: ${description}
CATEGORÍA: ${category || 'General'}

Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto (sin markdown, sin explicaciones, solo JSON puro):

{
  "specifications": [
    {"key": "Marca", "value": "..."},
    {"key": "Modelo", "value": "..."},
    {"key": "Material", "value": "..."},
    {"key": "Dimensiones", "value": "..."},
    {"key": "Peso", "value": "..."},
    {"key": "Garantía", "value": "..."},
    {"key": "Origen", "value": "..."},
    {"key": "Color", "value": "..."}
  ]
}

Reglas importantes:
1. Incluye entre 6 y 12 especificaciones relevantes según la categoría del producto
2. Los valores deben ser realistas, concisos y útiles para un comprador
3. Para tecnología: incluye specs técnicas como procesador, RAM, pantalla, batería, conectividad
4. Para ropa/accesorios: incluye material, tallas, cuidado, origen
5. Para audio: incluye frecuencia, impedancia, autonomía, tipo de conexión
6. No inventes marcas específicas reales, usa nombres genéricos o "Genérico"
7. Responde SOLO con el JSON, sin texto adicional`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extraer JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'La IA no devolvió un formato válido. Intenta de nuevo.' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    if (!parsed.specifications || !Array.isArray(parsed.specifications)) {
      return NextResponse.json({ error: 'Formato de respuesta incorrecto' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Gemini error:', error)
    return NextResponse.json({ error: error.message || 'Error generando especificaciones con IA' }, { status: 500 })
  }
}
