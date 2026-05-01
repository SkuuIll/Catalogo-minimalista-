import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-helper'

// PATCH - Approve/reject review
export async function PATCH(request: Request) {
  try {
    const authed = await verifyAuth(request)
    if (!authed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, approved, verified } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const update: any = {}
    if (typeof approved === 'boolean') update.approved = approved
    if (typeof verified === 'boolean') update.verified = verified

    const review = await prisma.review.update({
      where: { id },
      data: update,
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Error al actualizar review' }, { status: 500 })
  }
}
