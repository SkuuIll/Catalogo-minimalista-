import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      level = 'error',
      message,
      stack,
      url,
      userAgent,
      userId,
      metadata,
    } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const entry = await prisma.logEntry.create({
      data: {
        level,
        message: String(message).slice(0, 1000),
        stack: stack ? String(stack).slice(0, 5000) : null,
        url: url ? String(url).slice(0, 500) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        userId: userId || null,
        metadata: metadata ? JSON.stringify(metadata).slice(0, 2000) : null,
      },
    })

    return NextResponse.json({ success: true, id: entry.id })
  } catch (error) {
    console.error('Log API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level')
    const resolved = searchParams.get('resolved')
    const search = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (level && level !== 'all') where.level = level
    if (resolved === 'true') where.resolved = true
    else if (resolved === 'false') where.resolved = false
    if (search) {
      where.OR = [
        { message: { contains: search } },
        { stack: { contains: search } },
        { url: { contains: search } },
      ]
    }

    const [entries, total] = await Promise.all([
      prisma.logEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.logEntry.count({ where }),
    ])

    return NextResponse.json({
      entries,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Log API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}