import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const existing = await prisma.siteSettings.findFirst()

    const settings = await prisma.siteSettings.upsert({
      where: { id: existing?.id || 'default' },
      update: {
        siteName: body.siteName,
        siteTagline: body.siteTagline,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        primaryColor: body.primaryColor,
        showCategories: body.showCategories,
      },
      create: {
        id: 'default',
        siteName: body.siteName,
        siteTagline: body.siteTagline,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        primaryColor: body.primaryColor,
        showCategories: body.showCategories ?? true,
      },
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
