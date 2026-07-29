/**
 * 🛡️ Sistema Avançado de Rate Limiting
 *
 * Implementação robusta de rate limiting com múltiplas estratégias.
 * Em produção, recomenda-se usar Redis para distribuição.
 */

import { authConfig } from './security-config'

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequestTime: number
  blockedUntil?: number
}

interface RateLimitStore {
  [key: string]: RateLimitEntry
}

// Store em memória (em produção usar Redis com TTL)
const store: RateLimitStore = {}

// Limpeza periódica de entradas expiradas
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutos
let cleanupInterval: NodeJS.Timeout | null = null

function initCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetTime < now) delete store[key]
    }
  }, CLEANUP_INTERVAL)
}

export function cleanupExpired(): void {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) delete store[key]
  }
}

/**
 * Obtém o IP do cliente de forma segura
 */
export function getClientIP(request: Request | { headers: Headers }): string {
  const headers = request.headers
  const cfIP = headers.get('cf-connecting-ip')
  const forwarded = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  return cfIP || (forwarded ? forwarded.split(',')[0].trim() : null) || realIP || 'unknown'
}

function createRateLimitKey(
  identifier: string,
  type: 'login' | 'api' | 'upload' | 'custom' = 'api'
): string {
  return `ratelimit:${type}:${identifier}`
}

/**
 * Verifica se uma requisição excedeu o limite de taxa
 */
export function checkRateLimit(
  identifier: string,
  windowMs: number = 60 * 1000,
  maxRequests: number = 60,
  type: 'login' | 'api' | 'upload' | 'custom' = 'api',
  blockDurationMs: number = 15 * 60 * 1000
): {
  exceeded: boolean
  remaining: number
  resetTime: number
  blockUntil?: number
  totalRequests: number
  windowStart: number
  isBlocked: boolean
} {
  if (!cleanupInterval) initCleanup()

  const now = Date.now()
  const key = createRateLimitKey(identifier, type)
  const entry = store[key]

  // Verificar bloqueio ativo
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      exceeded: true,
      remaining: 0,
      resetTime: entry.blockedUntil,
      blockUntil: entry.blockedUntil,
      totalRequests: entry.count,
      windowStart: entry.firstRequestTime,
      isBlocked: true,
    }
  }

  // Nova janela ou janela expirada
  if (!entry || entry.resetTime < now) {
    store[key] = { count: 1, resetTime: now + windowMs, firstRequestTime: now }
    return {
      exceeded: false,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
      totalRequests: 1,
      windowStart: now,
      isBlocked: false,
    }
  }

  // Incrementar
  entry.count++
  const exceeded = entry.count > maxRequests
  if (exceeded && type === 'login') {
    entry.blockedUntil = now + blockDurationMs
  }

  return {
    exceeded,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime,
    blockUntil: entry.blockedUntil,
    totalRequests: entry.count,
    windowStart: entry.firstRequestTime,
    isBlocked: false,
  }
}

/**
 * Rate limiting específico para login
 */
export function checkLoginRateLimit(
  identifier: string,
  ip: string
): ReturnType<typeof checkRateLimit> {
  const cfg = authConfig.rateLimiting.login
  return checkRateLimit(
    `${ip}:${identifier}`,
    cfg.windowMs,
    cfg.maxAttempts,
    'login',
    30 * 60 * 1000
  )
}

/**
 * Rate limiting para API geral
 */
export function checkApiRateLimit(
  identifier: string,
  endpoint?: string
): ReturnType<typeof checkRateLimit> {
  const cfg = authConfig.rateLimiting.api
  const key = endpoint ? `${identifier}:${endpoint}` : identifier
  return checkRateLimit(key, cfg.windowMs, cfg.maxRequests, 'api')
}

/**
 * Obtém estatísticas de rate limiting
 */
export function getRateLimitStats(
  identifier: string,
  type?: 'login' | 'api' | 'upload'
): { currentRequests: number; windowStart: number; windowEnd: number; isBlocked: boolean; blockedUntil?: number } | null {
  const key = type ? createRateLimitKey(identifier, type) : identifier
  const entry = store[key]
  if (!entry) return null
  return {
    currentRequests: entry.count,
    windowStart: entry.firstRequestTime,
    windowEnd: entry.resetTime,
    isBlocked: !!entry.blockedUntil && entry.blockedUntil > Date.now(),
    blockedUntil: entry.blockedUntil,
  }
}

/**
 * Reseta o rate limiting para um identificador
 */
export function resetRateLimit(identifier: string, type?: 'login' | 'api' | 'upload'): boolean {
  const key = type ? createRateLimitKey(identifier, type) : identifier
  if (store[key]) {
    delete store[key]
    return true
  }
  return false
}

/**
 * Middleware de rate limiting para Next.js API routes
 */
export function withRateLimit(
  handler: Function,
  options: {
    type?: 'login' | 'api' | 'upload'
    windowMs?: number
    maxRequests?: number
    getIdentifier?: (req: Request) => string
    onRateLimited?: (req: Request, result: ReturnType<typeof checkRateLimit>) => Response
  } = {}
) {
  const {
    type = 'api',
    windowMs = 60 * 1000,
    maxRequests = 60,
    getIdentifier = (req) => getClientIP(req),
    onRateLimited = (_req, result) =>
      new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          resetTime: new Date(result.resetTime).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      ),
  } = options

  return async function (req: Request, ...args: any[]) {
    const identifier = getIdentifier(req)
    const result = checkRateLimit(identifier, windowMs, maxRequests, type)

    if (result.exceeded) return onRateLimited(req, result)

    const response = await handler(req, ...args)

    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    }

    return response
  }
}
