/**
 * 🛡️ Configurações de Segurança Centralizadas - EduPortal
 * 
 * Configurações de segurança aplicáveis a toda a plataforma
 */

// ============================================
// 🔐 CONFIGURAÇÕES DE AUTENTICAÇÃO
// ============================================

export const authConfig = {
  // JWT Configuration
  jwt: {
    algorithm: 'HS256' as const,
    expiresIn: '8h', // 8 horas
    issuer: 'eduportal-api',
    audience: 'eduportal-web',
    
    // Validação de claims
    requiredClaims: ['iss', 'aud', 'sub', 'iat', 'exp', 'login', 'papel', 'nome'],
    
    // Tamanho mínimo recomendado para JWT_SECRET
    minSecretLength: 32,
  },
  
  // Rate Limiting Configuration
  rateLimiting: {
    // Login attempts
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxAttempts: 5,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },
    
    // API requests (geral)
    api: {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 60,
      message: 'Muitas requisições. Tente novamente em 1 minuto.',
    },
    
    // Uploads/files
    upload: {
      windowMs: 5 * 60 * 1000, // 5 minutos
      maxUploads: 10,
      message: 'Muitos uploads. Tente novamente em 5 minutos.',
    },
  },
  
  // Cookie Security
  cookies: {
    name: 'token',
    httpOnly: true,
    path: '/',
    maxAge: 8 * 3600, // 8 horas em segundos
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    
    // Flags adicionais de segurança
    partitioned: true, // Suporte a CHIPS (Cookies Having Independent Partitioned State)
  },
  
  // Password Policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Opcional para não ser muito restritivo
    maxAgeDays: 90, // Trocar senha a cada 90 dias (recomendado)
  },
} as const

// ============================================
// 🔒 HEADERS DE SEGURANÇA HTTP
// ============================================

export const securityHeaders = {
  // Prevenção de ataques comuns
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Para desenvolvimento
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: true,
  },
  
  // Headers específicos
  standardHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
      ? 'max-age=31536000; includeSubDomains; preload' 
      : 'max-age=0',
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : ['https://seusite.com'], // Substituir pelo domínio real
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 horas
    credentials: true,
  },
} as const

// ============================================
// 🛡️ VALIDAÇÃO DE INPUT E SANITIZAÇÃO
// ============================================

export const inputValidation = {
  // Tamanhos máximos
  maxLengths: {
    username: 50,
    password: 100,
    eventTitle: 200,
    eventDescription: 2000,
    chatMessage: 1000,
    fileName: 255,
    fileSize: 10 * 1024 * 1024, // 10MB
    date: 10, // YYYY-MM-DD
  },
  
  // Patterns de validação
  patterns: {
    username: /^[a-zA-Z0-9._-]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    time: /^\d{2}:\d{2}$/,
  },
  
  // Sanitização
  sanitization: {
    stripTags: true,
    escapeHtml: true,
    normalizeWhitespace: true,
    trim: true,
  },
} as const

// ============================================
// 📊 LOGGING E MONITORAMENTO
// ============================================

export const loggingConfig = {
  // Níveis de log
  levels: {
    security: 'warn', // Logs de segurança sempre como warning ou error
    auth: 'info',
    rateLimit: 'warn',
    error: 'error',
  },
  
  // Informações sensíveis a mascarar
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'jwt',
    'authorization',
    'cookie',
    'senha',
    'cpf',
    'rg',
    'telefone',
    'email',
  ],
  
  // Formato dos logs
  format: {
    timestamp: true,
    level: true,
    message: true,
    userId: true,
    ipAddress: true,
    userAgent: true,
  },
} as const

// ============================================
// 🚨 POLÍTICAS DE SEGURANÇA ESPECÍFICAS
// ============================================

export const securityPolicies = {
  // Session Management
  session: {
    maxConcurrentSessions: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos de inatividade
    regenerateSessionOnLogin: true,
    destroySessionOnLogout: true,
  },
  
  // Brute Force Protection
  bruteForce: {
    lockoutThreshold: 10,
    lockoutDuration: 30 * 60 * 1000, // 30 minutos
    resetAfterSuccessfulAttempt: true,
  },
  
  // File Upload Security
  fileUpload: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    scanForMalware: true,
    virusTotalApiKey: process.env.VIRUS_TOTAL_API_KEY,
  },
  
  // Data Protection
  dataProtection: {
    encryptSensitiveData: true,
    encryptionAlgorithm: 'aes-256-gcm',
    keyRotationDays: 90,
    backupEncryption: true,
  },
} as const

// ============================================
// 🛠️ UTILITÁRIOS DE SEGURANÇA
// ============================================

/**
 * Valida se um JWT_SECRET é seguro o suficiente
 */
export function validateJwtSecret(secret: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!secret) {
    issues.push('JWT_SECRET não pode ser vazio')
    return { valid: false, issues }
  }
  
  if (secret.length < authConfig.jwt.minSecretLength) {
    issues.push(`JWT_SECRET muito curto. Mínimo ${authConfig.jwt.minSecretLength} caracteres`)
  }
  
  if (secret.includes('dev') || secret.includes('test') || secret.includes('example')) {
    issues.push('JWT_SECRET não deve conter palavras como "dev", "test" ou "example"')
  }
  
  // Verificar complexidade
  const hasUppercase = /[A-Z]/.test(secret)
  const hasLowercase = /[a-z]/.test(secret)
  const hasNumbers = /\d/.test(secret)
  const hasSpecial = /[^A-Za-z0-9]/.test(secret)
  
  if (!hasUppercase) issues.push('JWT_SECRET deve conter letras maiúsculas')
  if (!hasLowercase) issues.push('JWT_SECRET deve conter letras minúsculas')
  if (!hasNumbers) issues.push('JWT_SECRET deve conter números')
  if (!hasSpecial) issues.push('JWT_SECRET deve conter caracteres especiais')
  
  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Mascara dados sensíveis para logs
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const masked = { ...data }
  
  for (const field of loggingConfig.sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***MASKED***'
    }
  }
  
  return masked
}

/**
 * Gera headers de segurança HTTP
 */
export function generateSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // Headers padrão
  Object.entries(securityHeaders.standardHeaders).forEach(([key, value]) => {
    headers[key] = value
  })
  
  // CSP
  const cspDirectives = Object.entries(securityHeaders.contentSecurityPolicy)
    .map(([directive, values]) => {
      if (typeof values === 'boolean') {
        return directive
      }
      return `${directive} ${Array.isArray(values) ? values.join(' ') : values}`
    })
    .join('; ')
  
  headers['Content-Security-Policy'] = cspDirectives
  
  return headers
}

/**
 * Valida input contra políticas de segurança
 */
export function validateInput(input: any, type: keyof typeof inputValidation.maxLengths): {
  valid: boolean
  errors: string[]
  sanitized: any
} {
  const errors: string[] = []
  let sanitized = input
  
  // Validação de tipo
  if (typeof sanitized !== 'string') {
    errors.push(`Input deve ser uma string`)
    return { valid: false, errors, sanitized }
  }
  
  // Sanitização
  if (inputValidation.sanitization.trim) {
    sanitized = sanitized.trim()
  }
  
  if (inputValidation.sanitization.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ')
  }
  
  // Validação de tamanho
  const maxLength = inputValidation.maxLengths[type]
  if (sanitized.length > maxLength) {
    errors.push(`Máximo de ${maxLength} caracteres excedido`)
  }
  
  // Validação de pattern (se aplicável)
  const pattern = inputValidation.patterns[type as keyof typeof inputValidation.patterns]
  if (pattern && !pattern.test(sanitized)) {
    errors.push(`Formato inválido para ${type}`)
  }
  
  // Sanitização HTML (se aplicável)
  if (inputValidation.sanitization.escapeHtml && type === 'eventDescription') {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  }
}

// Exportação de tipos
export type AuthConfig = typeof authConfig
export type SecurityHeaders = typeof securityHeaders
export type InputValidation = typeof inputValidation
export type LoggingConfig = typeof loggingConfig
export type SecurityPolicies = typeof securityPolicies