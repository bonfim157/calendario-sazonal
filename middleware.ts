import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityHeaders, generateSecurityHeaders } from './lib/security-config'

/**
 * Middleware de segurança para todas as rotas
 * Aplica headers de segurança, rate limiting, e outras proteções
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Aplicar headers de segurança em todas as respostas
  const securityHeaders = generateSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // CORS headers
  const origin = request.headers.get('origin')
  const isAllowedOrigin = securityHeaders.cors.origin.includes(origin || '')
  
  if (origin && isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', securityHeaders.cors.methods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', securityHeaders.cors.allowedHeaders.join(', '))
    response.headers.set('Access-Control-Expose-Headers', securityHeaders.cors.exposedHeaders.join(', '))
    response.headers.set('Access-Control-Max-Age', securityHeaders.cors.maxAge.toString())
  }
  
  // Rate limiting headers (serão populados pelas rotas específicas)
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', '99')
  response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 60).toString())
  
  // Headers adicionais
  response.headers.set('X-Powered-By', 'EduPortal Platform')
  response.headers.set('X-Platform-Version', '1.0.0')
  
  // Prevenir caching de dados sensíveis
  if (request.nextUrl.pathname.includes('/api/auth') || 
      request.nextUrl.pathname.includes('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  return response
}

/**
 * Configuração do middleware
 * Aplica a todas as rotas, exceto arquivos estáticos e páginas públicas
 */
export const config = {
  matcher: [
    /*
     * Match todas as rotas de API e páginas da aplicação
     * Exclui:
     * - Arquivos estáticos (_next/static, public, favicon.ico, etc.)
     * - Assets (imagens, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)',
  ],
}