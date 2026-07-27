import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { isConfigured, supabase } from '@/lib/supabase'
import { LoginSchema } from '@/lib/validation'
import getDB from '@/lib/db'

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
      { login: userRecord.login, papel: userRecord.papel, nome: userRecord.nome },
      SECRET,
      { expiresIn: '8h' }
    )

    const res = NextResponse.json({
      ok: true,
      user: { login: userRecord.login, nome: userRecord.nome, papel: userRecord.papel },
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
