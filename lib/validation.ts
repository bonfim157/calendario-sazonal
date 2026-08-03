import { z } from 'zod'
import { inputValidation } from './security-config'

// ============================================
// 🛡️ VALIDAÇÃO COM SANITIZAÇÃO
// ============================================

/**
 * Sanitiza strings removendo caracteres perigosos
 */
function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ') // Normaliza espaços
    .replace(/[<>]/g, '') // Remove tags HTML
    .substring(0, 1000) // Limita tamanho
}

/**
 * Sanitiza input baseado no tipo
 */
function sanitizeInput(value: any, type: keyof typeof inputValidation.maxLengths): any {
  if (typeof value !== 'string') return value
  
  let sanitized = value.trim()
  
  if (inputValidation.sanitization.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ')
  }
  
  // Limitar tamanho máximo
  const maxLength = inputValidation.maxLengths[type]
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  // Sanitização específica por tipo
  switch (type) {
    case 'username':
      // Apenas caracteres alfanuméricos e alguns especiais
      sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '')
      break
      
    case 'eventDescription':
    case 'chatMessage':
      // Escapar HTML para prevenir XSS
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
      break
      
    case 'date':
      // Validar formato de data
      if (!inputValidation.patterns.date.test(sanitized)) {
        throw new Error('Formato de data inválido')
      }
      break
  }
  
  return sanitized
}

// ============================================
// 📝 SCHEMAS DE VALIDAÇÃO
// ============================================

/**
 * Schema base com transformação de sanitização
 */
function createSanitizedSchema<T extends z.ZodTypeAny>(
  schema: T,
  fieldName: keyof typeof inputValidation.maxLengths
) {
  return schema.transform((value: unknown, ctx: z.RefinementCtx) => {
    try {
      return sanitizeInput(value, fieldName)
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error instanceof Error ? error.message : 'Erro de sanitização',
      })
      return undefined as never
    }
  })
}

// ============================================
// 🚪 AUTENTICAÇÃO
// ============================================

export const LoginSchema = z.object({
  login: createSanitizedSchema(
    z.string()
      .min(3, 'Mínimo 3 caracteres')
      .max(inputValidation.maxLengths.username, `Máximo ${inputValidation.maxLengths.username} caracteres`)
      .regex(inputValidation.patterns.username, 'Apenas letras, números, ., _, -'),
    'username'
  ),
  senha: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(inputValidation.maxLengths.password, `Máximo ${inputValidation.maxLengths.password} caracteres`)
    .refine((val) => {
      // Validação de força da senha
      const hasUppercase = /[A-Z]/.test(val)
      const hasLowercase = /[a-z]/.test(val)
      const hasNumbers = /\d/.test(val)
      
      return hasUppercase && hasLowercase && hasNumbers
    }, 'Senha deve conter letras maiúsculas, minúsculas e números'),
})

// ============================================
// 📅 EVENTOS
// ============================================

export const EventSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Data inválida')
    .refine((val) => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    }, 'Data não pode ser no passado'),
    
  title: createSanitizedSchema(
    z.string()
      .min(1, 'Título obrigatório')
      .max(inputValidation.maxLengths.eventTitle, `Máximo ${inputValidation.maxLengths.eventTitle} caracteres`),
    'eventTitle'
  ),
  
  category: z.enum(['red', 'yellow', 'green', 'blue', 'purple', 'orange'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida' }),
  }),
  
  hora: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM')
    .optional()
    .nullable(),
    
  local: createSanitizedSchema(
    z.string()
      .max(200, 'Máximo 200 caracteres')
      .optional()
      .nullable(),
    'eventTitle'
  ),
  
  nota: createSanitizedSchema(
    z.string()
      .max(inputValidation.maxLengths.eventDescription, `Máximo ${inputValidation.maxLengths.eventDescription} caracteres`)
      .optional()
      .nullable(),
    'eventDescription'
  ),
  
  autor_login: z.string().optional(),
  
  // Campos de auditoria
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine((data) => {
  // Validação de hora se fornecida
  if (data.hora) {
    const [hours, minutes] = data.hora.split(':').map(Number)
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  }
  return true
}, {
  message: 'Hora inválida',
  path: ['hora'],
})

// ============================================
// ✅ APROVAÇÃO
// ============================================

export const ApproveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status deve ser "approved" ou "rejected"' }),
  }),
  
  aprovadoPor: z.string()
    .min(1, 'Aprovador obrigatório')
    .optional(),
    
  motivo: createSanitizedSchema(
    z.string()
      .max(500, 'Máximo 500 caracteres')
      .optional()
      .nullable(),
    'eventDescription'
  ),
  
  // Campos de auditoria
  reviewed_at: z.string().datetime().optional(),
}).refine((data) => {
  // Se rejeitado, motivo é obrigatório
  if (data.status === 'rejected' && (!data.motivo || data.motivo.trim().length === 0)) {
    return false
  }
  return true
}, {
  message: 'Motivo é obrigatório para rejeição',
  path: ['motivo'],
})

// ============================================
// 💬 MENSAGENS
// ============================================

export const MessageSchema = z.object({
  text: createSanitizedSchema(
    z.string()
      .min(1, 'Mensagem não pode estar vazia')
      .max(inputValidation.maxLengths.chatMessage, `Máximo ${inputValidation.maxLengths.chatMessage} caracteres`),
    'chatMessage'
  ),
  
  from_login: z.string()
    .min(1, 'Remetente obrigatório')
    .max(inputValidation.maxLengths.username, `Máximo ${inputValidation.maxLengths.username} caracteres`),
    
  to_login: z.string()
    .max(inputValidation.maxLengths.username, `Máximo ${inputValidation.maxLengths.username} caracteres`)
    .optional()
    .nullable(),
    
  // Campos de metadados
  is_edited: z.boolean().optional().default(false),
  edited_at: z.string().datetime().optional().nullable(),
  replied_to: z.string().optional().nullable(),
}).refine((data) => {
  // Não permitir mensagens para si mesmo (exceto se for sistema)
  if (data.from_login === data.to_login && data.from_login !== 'system') {
    return false
  }
  return true
}, {
  message: 'Não é possível enviar mensagem para si mesmo',
  path: ['to_login'],
})

// ============================================
// 👤 USUÁRIOS
// ============================================

export const UserSchema = z.object({
  login: createSanitizedSchema(
    z.string()
      .min(3, 'Mínimo 3 caracteres')
      .max(inputValidation.maxLengths.username, `Máximo ${inputValidation.maxLengths.username} caracteres`)
      .regex(inputValidation.patterns.username, 'Apenas letras, números, ., _, -'),
    'username'
  ),
  
  nome: createSanitizedSchema(
    z.string()
      .min(2, 'Mínimo 2 caracteres')
      .max(100, 'Máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apenas letras e espaços'),
    'username'
  ),
  
  papel: z.enum(['professor', 'aluno', 'gestao'], {
    errorMap: () => ({ message: 'Papel inválido' }),
  }),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Máximo 255 caracteres')
    .optional()
    .nullable(),
    
  telefone: z.string()
    .max(20, 'Máximo 20 caracteres')
    .regex(inputValidation.patterns.phone, 'Telefone inválido')
    .optional()
    .nullable(),
})

// ============================================
// 🛠️ UTILITÁRIOS
// ============================================

/**
 * Valida e sanitiza dados usando um schema Zod
 */
export async function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const result = await schema.safeParseAsync(data)
    
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      errors: ['Erro interno de validação'],
    }
  }
}

/**
 * Middleware de validação para Next.js API routes
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, req: Request) => Promise<Response>
) {
  return async function (req: Request) {
    try {
      const body = await req.json().catch(() => null)
      
      const validation = await validateAndSanitize(schema, body)
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({
            error: 'Dados inválidos',
            details: validation.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      
      return handler(validation.data, req)
    } catch (error) {
      console.error('Validation middleware error:', error)
      
      return new Response(
        JSON.stringify({
          error: 'Erro interno do servidor',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}

// ============================================
// 📋 TIPOS EXPORTADOS
// ============================================

export type LoginData = z.infer<typeof LoginSchema>
export type EventData = z.infer<typeof EventSchema>
export type ApproveData = z.infer<typeof ApproveSchema>
export type MessageData = z.infer<typeof MessageSchema>
export type UserData = z.infer<typeof UserSchema>
