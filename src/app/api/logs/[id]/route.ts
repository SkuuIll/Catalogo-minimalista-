import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, resolved, resolvedBy } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const entry = await prisma.logEntry.update({
      where: { id },
      data: {
        resolved: resolved ?? true,
        resolvedBy: resolvedBy || null,
        resolvedAt: resolved ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Log update error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.logEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log delete error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}