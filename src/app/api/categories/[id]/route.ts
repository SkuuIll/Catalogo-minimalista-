import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    await prisma.category.delete({
      where: { id: resolvedParams.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const category = await prisma.category.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        order: body.order,
        active: body.active,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 })
  }
}
