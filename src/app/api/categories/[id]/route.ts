import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-helper'

function err(msg: string) {
  return NextResponse.json({ error: msg }, { status: 500 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await verifyAuth(request)
  if (!authed) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const resolvedParams = await params
    await prisma.category.delete({ where: { id: resolvedParams.id } })
    return NextResponse.json({ success: true })
  } catch { return err('Error al eliminar categoría') }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await verifyAuth(request)
  if (!authed) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const resolvedParams = await params
    const body = await request.json()
    const category = await prisma.category.update({
      where: { id: resolvedParams.id },
      data: {
        name: body.name, slug: body.slug,
        description: body.description, icon: body.icon,
        order: body.order, active: body.active, parentId: body.parentId,
      }
    })
    return NextResponse.json(category)
  } catch { return err('Error al actualizar categoría') }
}
