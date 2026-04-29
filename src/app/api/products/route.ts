import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}
    if (category && category !== 'all') {
      where.categoryId = category
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        status: body.status || 'AVAILABLE',
        categoryId: body.categoryId || null,
        categoryName: body.categoryName || null,
        images: body.images,
        imageUrl: body.imageUrl,
        imagePath: body.imagePath,
        featured: body.featured || false,
      }
    })

    // Crear especificaciones si existen
    if (body.specifications && Array.isArray(body.specifications)) {
      await prisma.specification.createMany({
        data: body.specifications
          .filter((s: any) => s.key && s.value)
          .map((s: any) => ({
            key: s.key,
            value: s.value,
            productId: product.id,
          }))
      })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 })
  }
}
