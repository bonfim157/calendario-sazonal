/**
 * 🛡️ Sistema Avançado de Rate Limiting
 * 
 * Implementação robusta de rate limiting com múltiplas estratégias
 * Em produção, recomenda-se usar Redis para distribuição
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

/**
 * Inicializa a limpeza periódica do store
 */
function initCleanup() {
  if (cleanupInterval) return
  
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    let cleaned = 0
    
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.debug(`🧹 Rate limiting: Limpadas ${cleaned} entradas expiradas`)
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Limpa entradas expiradas do store
 */
export function cleanupExpired(): void {
  const now = Date.now()
  
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}

/**
 * Obtém o IP do cliente de forma segura
 */
export function getClientIP(request: Request | { headers: Headers }): string {
  const headers = request.headers
  
  // Tentar obter IP real considerando proxies
  const cfConnectingIP = headers.get('cf-connecting-ip')
  const xForwardedFor = headers.get('x-forwarded-for')
  const xRealIP = headers.get('x-real-ip')
  
  // Ordem de prioridade para obter IP
  const ip = cfConnectingIP || 
            (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
            xRealIP ||
            'unknown'
  
  return ip
}

/**
 * Cria uma chave única para rate limiting
 */
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
  windowMs: number = 60 * 1000, // 1 minuto padrão
  maxRequests: number = 60, // 60 requisições por minuto padrão
  type: 'login' | 'api' | 'upload' | 'custom' = 'api',
  blockDurationMs: number = 15 * 60 * 1000 // 15 minutos de bloqueio
): { 
  exceeded: boolean
  remaining: number
  resetTime: number
  blockUntil?: number
  totalRequests: number
  windowStart: number
  isBlocked: boolean
} {
  // Inicializar limpeza se necessário
  if (!cleanupInterval) {
    initCleanup()
  }
  
  const now = Date.now()
  const key = createRateLimitKey(identifier, type)
  
  // Verificar se está bloqueado
  const currentEntry = store[key]
  if (currentEntry?.blockedUntil && currentEntry.blockedUntil > now) {
    return {
      exceeded: true,
      remaining: 0,
      resetTime: currentEntry.blockedUntil,
      blockUntil: currentEntry.blockedUntil,
      totalRequests: currentEntry.count,
      windowStart: currentEntry.firstRequestTime,
      isBlocked: true,
    }
  }
  
  // Nova janela ou janela expirada
  if (!currentEntry || currentEntry.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
      firstRequestTime: now,
    }
    
    return {
      exceeded: false,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
      totalRequests: 1,
      windowStart: now,
      isBlocked: false,
    }
  }
  
  // Incrementar contador na janela atual
  currentEntry.count++
  
  // Verificar se excedeu o limite
  const exceeded = currentEntry.count > maxRequests
  
  if (exceeded && type === 'login') {
    // Para tentativas de login, bloquear por tempo maior
    currentEntry.blockedUntil = now + blockDurationMs
  }
  
  return {
    exceeded,
    remaining: Math.max(0, maxRequests - currentEntry.count),
    resetTime: currentEntry.resetTime,
    blockUntil: currentEntry.blockedUntil,
    totalRequests: currentEntry.count,
    windowStart: currentEntry.firstRequestTime,
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
  const loginConfig = authConfig.rateLimiting.login
  
  // Usar combinação de identificador e IP para maior segurança
  const combinedIdentifier = `${ip}:${identifier}`
  
  return checkRateLimit(
    combinedIdentifier,
    loginConfig.windowMs,
    loginConfig.maxAttempts,
    'login',
    30 * 60 * 1000 // 30 minutos de bloqueio após muitas tentativas
  )
}

/**
 * Rate limiting para API geral
 */
export function checkApiRateLimit(
  identifier: string,
  endpoint?: string
): ReturnType<typeof checkRateLimit> {
  const apiConfig = authConfig.rateLimiting.api
  
  // Incluir endpoint na chave se fornecido
  const key = endpoint ? `${identifier}:${endpoint}` : identifier
  
  return checkRateLimit(
    key,
    apiConfig.windowMs,
    apiConfig.maxRequests,
    'api'
  )
}

/**
 * Obtém estatísticas de rate limiting
 */
export function getRateLimitStats(identifier: string, type?: 'login' | 'api' | 'upload'): {
  currentRequests: number
  windowStart: number
  windowEnd: number
  isBlocked: boolean
  blockedUntil?: number
} | null {
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
    onRateLimited = (req, result) => {
      return new Response(
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
      )
    }
  } = options
  
  return async function (req: Request, ...args: any[]) {
    const identifier = getIdentifier(req)
    const result = checkRateLimit(identifier, windowMs, maxRequests, type)
    
    if (result.exceeded) {
      return onRateLimited(req, result)
    }
    
    // Executar handler original
    const response = await handler(req, ...args)
    
    // Adicionar headers de rate limiting à resposta
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    }
    
    return response
  }
}
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      exceeded: false,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
    };
  }
  
  // Incrementa contador na janela existente
  store[key].count += 1;
  
  if (store[key].count > maxRequests) {
    return {
      exceeded: true,
      remaining: 0,
      resetTime: store[key].resetTime,
    };
  }
  
  return {
    exceeded: false,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  };
}

/**
 * Middleware para rate limiting de IP
 */
export function withRateLimit(
  handler: Function,
  options?: {
    windowMs?: number;
    maxRequests?: number;
    getIdentifier?: (req: Request) => string;
  }
) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    maxRequests = 10, // 10 requisições
    getIdentifier = (req: Request) => {
      // Usa IP como identificador padrão
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
      return ip;
    },
  } = options || {};
  
  return async function (req: Request, ...args: any[]) {
    const identifier = getIdentifier(req);
    const limit = checkRateLimit(identifier, windowMs, maxRequests);
    
    if (limit.exceeded) {
      return new Response(
        JSON.stringify({
          erro: 'Muitas requisições. Tente novamente mais tarde.',
          detalhes: {
            resetTime: new Date(limit.resetTime).toISOString(),
            remaining: limit.remaining,
          },
        }),
        {
          status: 429, // Too Many Requests
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
            'Retry-After': Math.ceil((limit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    // Adiciona headers de rate limit na resposta
    const response = await handler(req, ...args);
    
    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', maxRequests.toString());
      headers.set('X-RateLimit-Remaining', limit.remaining.toString());
      headers.set('X-RateLimit-Reset', limit.resetTime.toString());
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    
    return response;
  };
}

/**
 * Configurações específicas por endpoint
 */
export const rateLimitConfigs = {
  // Login: mais restritivo (5 tentativas em 15 minutos)
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 tentativas de login
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  
  // APIs gerais: mais permissivo
  api: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requisições por minuto
    message: 'Muitas requisições à API. Reduza a frequência.',
  },
  
  // Chat: limite moderado
  chat: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 mensagens por minuto
    message: 'Muitas mensagens enviadas. Aguarde um momento.',
  },
};

/**
 * Utilitário para obter IP do cliente
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    // Pega o primeiro IP da lista (cliente original)
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback para desenvolvimento
  return '127.0.0.1';
}