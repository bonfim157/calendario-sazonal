import { z } from 'zod'

export const LoginSchema = z.object({
  login: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  senha: z.string().min(4, 'Mínimo 4 caracteres').max(100),
})

export const EventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'),
  title: z.string().min(1, 'Título obrigatório').max(200),
  category: z.enum(['red', 'yellow', 'green', 'blue', 'purple', 'orange'], {
    error: 'Categoria inválida',
  }),
  nota: z.string().max(500).optional(),
  autor_login: z.string().optional(),
})

export const ApproveSchema = z.object({
  status: z.enum(['approved', 'rejected'], { error: 'Status deve ser approved ou rejected' }),
  aprovadoPor: z.string().optional(),
  motivo: z.string().max(500).optional(),
})

export const MessageSchema = z.object({
  text: z.string().min(1, 'Mensagem não pode estar vazia').max(1000),
  from_login: z.string().min(1, 'Remetente obrigatório'),
  to_login: z.string().optional().nullable(),
})
