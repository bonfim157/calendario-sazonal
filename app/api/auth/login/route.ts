import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'
import { LoginSchema } from '@/lib/validation'

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

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
    const { data: user, error } = await supabase
      .from('users')
      .select('login, nome, papel, senha_hash')
      .eq('login', login)
      .single()

    if (error || !user) {
      return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 401 })
    }
    if (!user.senha_hash) {
      return NextResponse.json(
        { erro: 'Conta não configurada — contate a administração' },
        { status: 401 }
      )
    }

    const ok = await bcrypt.compare(senha, user.senha_hash)
    if (!ok) {
      return NextResponse.json({ erro: 'Senha inválida' }, { status: 401 })
    }

    const token = jwt.sign(
      { login: user.login, papel: user.papel, nome: user.nome },
      SECRET,
      { expiresIn: '8h' }
    )

    const res = NextResponse.json({
      ok: true,
      user: { login: user.login, nome: user.nome, papel: user.papel },
    })
    res.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}; SameSite=Lax`
    )
    return res
  } catch {
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
