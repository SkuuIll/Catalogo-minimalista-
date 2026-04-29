import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const pathname = request.nextUrl.pathname

  // Allow login and logout without session
  if (pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
    return NextResponse.next()
  }

  // API calls: solo verificar que exista cookie, la validación real se hace en las API routes
  if (pathname.startsWith('/api/')) {
    const isSafeMethod = request.method === 'GET'
    const isSafePath = pathname.startsWith('/api/products') ||
      pathname.startsWith('/api/categories') ||
      pathname.startsWith('/api/settings')

    if (isSafeMethod && isSafePath) {
      return NextResponse.next()
    }

    // GET for uploads/images are safe — don't require session
    if (request.method === 'GET' && (
      pathname.startsWith('/api/uploads/') ||
      pathname.startsWith('/api/products') ||
      pathname.startsWith('/api/categories') ||
      pathname.startsWith('/api/settings')
    )) {
      return NextResponse.next()
    }

    // POST, PATCH, DELETE, etc requieren sesión
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Admin pages: redirigir a login si no hay sesión
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Login: redirigir a admin si ya tiene sesión
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
'/api/auth/:path*',
      '/api/products/:path*',
      '/api/categories/:path*',
      '/api/settings/:path*',
      '/api/gemini/:path*',
      '/api/uploads/:path*',
  ],
}
