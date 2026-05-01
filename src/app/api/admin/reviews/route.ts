import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-helper'

// GET all reviews (admin) or by product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const approved = searchParams.get('approved')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (productId) where.productId = productId
    if (approved !== null && approved !== undefined) {
      where.approved = approved === 'true'
    }

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            }
          }
        }
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Error al cargar reviews' }, { status: 500 })
  }
}

// DELETE review (admin)
export async function DELETE(request: Request) {
  try {
    const authed = await verifyAuth(request)
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Review eliminada' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Error al eliminar review' }, { status: 500 })
  }
}
