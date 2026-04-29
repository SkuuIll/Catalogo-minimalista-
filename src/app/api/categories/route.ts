import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { products: true } },
        children: true,
        parent: true,
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: body.description,
        icon: body.icon,
        order: body.order ?? 0,
        parentId: body.parentId || null,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
