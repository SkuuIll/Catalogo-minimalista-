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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    await prisma.product.delete({
      where: { id: resolvedParams.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()

    // Actualizar producto
    const product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        discountPrice: body.discountPrice !== undefined ? (body.discountPrice ? parseFloat(body.discountPrice) : null) : undefined,
        status: body.status,
        categoryId: body.categoryId || null,
        categoryName: body.categoryName || null,
        images: body.images,
        imageUrl: body.imageUrl,
        imagePath: body.imagePath,
        featured: body.featured,
      }
    })

    // Reemplazar especificaciones
    if (body.specifications !== undefined) {
      await prisma.specification.deleteMany({ where: { productId: resolvedParams.id } })
      if (Array.isArray(body.specifications) && body.specifications.length > 0) {
        await prisma.specification.createMany({
          data: body.specifications
            .filter((s: any) => s.key && s.value)
            .map((s: any) => ({
              key: s.key,
              value: s.value,
              productId: resolvedParams.id,
            }))
        })
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('PATCH product error:', error)
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 })
  }
}
