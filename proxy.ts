import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Headers de segurança aplicados em todas as respostas
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':    'nosniff',
  'X-Frame-Options':           'DENY',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
  'X-Powered-By':              'EduPortal Platform',
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rotas públicas — sem verificação de sessão
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/login') ||
    pathname === '/'
  ) {
    const res = NextResponse.next()
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }

  // Proteger /dashboard — redirecionar para login se não há token
  const cookie = req.cookies.get('token')
  if (!cookie && pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const res = NextResponse.next()

  // Aplicar headers de segurança
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v))

  // Sem cache para rotas sensíveis
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/auth')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.headers.set('Pragma', 'no-cache')
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
