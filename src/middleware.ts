import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // Proteger /admin y operaciones destructivas en /api/products
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    (request.nextUrl.pathname.startsWith('/api/products') && request.method !== 'GET')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      await decrypt(session)
      return NextResponse.next()
    } catch (error) {
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
  matcher: ['/admin/:path*', '/login', '/api/products/:path*'],
}
