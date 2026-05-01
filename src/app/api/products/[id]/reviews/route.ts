import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reviews = await prisma.review.findMany({
      where: {
        productId: id,
        approved: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating
    const average = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      average: Math.round(average * 10) / 10,
      total: reviews.length,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({
      reviews: [],
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { rating, title, comment, authorName, authorEmail } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating debe ser entre 1 y 5' }, { status: 400 })
    }
    if (!authorName || authorName.trim().length === 0) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    })
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Create review (requires admin approval by default)
    const review = await prisma.review.create({
      data: {
        productId: id,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        approved: false, // Requires moderation
        verified: false,
      },
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review enviada. Será publicada tras moderación.',
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Error al crear review' }, { status: 500 })
  }
}
