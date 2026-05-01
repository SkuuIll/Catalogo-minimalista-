import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search') || searchParams.get('q')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (category && category !== 'all') {
      where.categoryId = category
    }
    if (status && status !== 'all') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'price-asc') orderBy = { price: 'asc' }
    else if (sort === 'price-desc') orderBy = { price: 'desc' }
    else if (sort === 'name') orderBy = { name: 'asc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true }
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('GET products error:', error)
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authed = await verifyAuth(request)
  if (!authed) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
