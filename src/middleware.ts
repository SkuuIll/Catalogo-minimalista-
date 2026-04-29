import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  const adminPaths = [
    '/admin',
    '/api/products',
    '/api/categories',
    '/api/upload',
    '/api/settings',
  ]

  const isAdminPath = adminPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Proteger rutas admin y operaciones destructivas
  if (isAdminPath) {
    const isSafeMethod = request.method === 'GET' &&
      (request.nextUrl.pathname.startsWith('/api/products') ||
       request.nextUrl.pathname.startsWith('/api/categories') ||
       request.nextUrl.pathname.startsWith('/api/settings'))

    if (isSafeMethod && !request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next()
    }

    if (!session) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      await decrypt(session)
      return NextResponse.next()
    } catch (error) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Si intentan entrar a login ya logueados
  if (request.nextUrl.pathname === '/login') {
    if (session) {
      try {
        await decrypt(session)
        return NextResponse.redirect(new URL('/admin', request.url))
      } catch (error) {
        return NextResponse.next()
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/api/products/:path*',
    '/api/categories/:path*',
    '/api/upload/:path*',
    '/api/settings/:path*',
  ],
}
