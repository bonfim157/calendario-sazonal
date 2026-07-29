import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { isConfigured, supabase } from '@/lib/supabase'
import { LoginSchema } from '@/lib/validation'
import getDB from '@/lib/db'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

// Configuração segura do JWT_SECRET
const getJwtSecret = () => {
  const SECRET = process.env.JWT_SECRET
  
  if (!SECRET) {
    console.error('❌ JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.')
    
    // Em produção, NUNCA usar fallback - falhar imediatamente
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET não configurado para produção')
    }
    
    // Em desenvolvimento, usar fallback seguro com warning explícito
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  ⚠️  ⚠️  ATENÇÃO: Usando JWT_SECRET de desenvolvimento.')
      console.warn('⚠️  Configure JWT_SECRET no arquivo .env.local para produção.')
      console.warn('⚠️  Exemplo: JWT_SECRET=seu_segredo_super_seguro_aqui')
      
      // Gerar um fallback seguro baseado em hash do ambiente
      const fallbackSecret = Buffer.from(
        `dev_fallback_${process.cwd()}_${Date.now()}`
      ).toString('base64')
      
      return fallbackSecret
    }
    
    // Para outros ambientes (teste, staging), falhar também
    throw new Error('JWT_SECRET não configurado')
  }
  
  // Validar que o secret tem tamanho mínimo seguro
  if (SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET muito curto. Recomendado mínimo 32 caracteres.')
  }
  
  return SECRET
}

const JWT_SECRET = getJwtSecret()

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { login, senha } = parsed.data

    // 🛡️ Rate Limiting para proteção contra brute force
    const clientIP = getClientIP(req)
    const rateLimitKey = `login:${clientIP}:${login}`
    const rateLimit = checkRateLimit(rateLimitKey, 15 * 60 * 1000, 5) // 5 tentativas em 15 minutos
    
    if (rateLimit.exceeded) {
      return NextResponse.json(
        { 
          erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          detalhes: {
            resetTime: new Date(rateLimit.resetTime).toISOString(),
            tentativasRestantes: rateLimit.remaining,
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          }
        }
      )
    }
    let userRecord: { login: string; nome: string; papel: string; hash: string } | null = null

    if (isConfigured) {
      const { data: user, error } = await supabase
        .from('users')
        .select('login, nome, papel, senha_hash')
        .eq('login', login)
        .single()
      if (!error && user && user.senha_hash) {
        userRecord = { login: user.login, nome: user.nome, papel: user.papel, hash: user.senha_hash }
      }
    } else {
      const db = await getDB()
      const u = (db.data!.users as any[]).find(u => u.login === login)
      const hash = u?.senha_hash ?? u?.senha
      if (u && hash) {
        userRecord = { login: u.login, nome: u.nome, papel: u.papel, hash }
      }
    }

    if (!userRecord) {
      return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 401 })
    }

    const ok = await bcrypt.compare(senha, userRecord.hash)
    if (!ok) {
      return NextResponse.json({ erro: 'Senha inválida' }, { status: 401 })
    }

    const token = jwt.sign(
      { 
        login: userRecord.login, 
        papel: userRecord.papel, 
        nome: userRecord.nome,
        iss: 'eduportal-api',
        aud: 'eduportal-web',
        sub: userRecord.login,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { 
        expiresIn: '8h',
        algorithm: 'HS256'
      }
    )

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = [
      `token=${token}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${8 * 3600}`,
      'SameSite=Lax',
      ...(isProduction ? ['Secure'] : []) // Apenas HTTPS em produção
    ]

    const res = NextResponse.json({
      ok: true,
      user: { login: userRecord.login, nome: userRecord.nome, papel: userRecord.papel },
    })
    
    res.headers.set('Set-Cookie', cookieOptions.join('; '))
    
    // Headers de segurança adicionais
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-XSS-Protection', '1; mode=block')
    
    return res
  } catch {
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
