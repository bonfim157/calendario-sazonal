/**
 * 🛡️ Rate Limiting Simples para APIs
 * 
 * Implementação básica de rate limiting para proteção contra brute force
 * Em produção, usar soluções como Redis ou serviços dedicados
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store simples em memória (em produção usar Redis)
const store: RateLimitStore = {};

/**
 * Limpa entradas expiradas do store
 */
function cleanupExpired() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

/**
 * Verifica se uma requisição excedeu o limite de taxa
 * 
 * @param identifier Identificador único (ex: IP, userId)
 * @param windowMs Janela de tempo em milissegundos
 * @param maxRequests Número máximo de requisições na janela
 * @returns Retorna true se excedeu o limite
 */
export function checkRateLimit(
  identifier: string,
  windowMs: number = 15 * 60 * 1000, // 15 minutos padrão
  maxRequests: number = 10 // 10 requisições padrão
): { exceeded: boolean; remaining: number; resetTime: number } {
  cleanupExpired();
  
  const now = Date.now();
  const key = `rate-limit:${identifier}`;
  
  if (!store[key] || store[key].resetTime < now) {
    // Nova janela de tempo
    store[key] = {
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