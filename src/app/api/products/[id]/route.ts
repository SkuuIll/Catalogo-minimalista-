import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: { include: { parent: true } },
        specifications: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el producto' }, { status: 500 })
  }
}
