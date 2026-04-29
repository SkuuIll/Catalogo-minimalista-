import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authed = await verifyAuth(request)
  if (!authed) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const body = await request.json()
    const existing = await prisma.siteSettings.findFirst()
    const settings = await prisma.siteSettings.upsert({
      where: { id: existing?.id || 'default' },
      update: {
        siteName: body.siteName,
        siteTagline: body.siteTagline,
        siteDescription: body.siteDescription,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        primaryColor: body.primaryColor,
        logoUrl: body.logoUrl,
        faviconUrl: body.faviconUrl,
        showCategories: body.showCategories,
        geminiApiKey: body.geminiApiKey,
        whatsappNumber: body.whatsappNumber,
        whatsappMessage: body.whatsappMessage,
      },
      create: {
        id: 'default',
        siteName: body.siteName,
        siteTagline: body.siteTagline,
        siteDescription: body.siteDescription,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        primaryColor: body.primaryColor,
        logoUrl: body.logoUrl,
        faviconUrl: body.faviconUrl,
        showCategories: body.showCategories ?? true,
        geminiApiKey: body.geminiApiKey,
        whatsappNumber: body.whatsappNumber,
        whatsappMessage: body.whatsappMessage,
      },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
