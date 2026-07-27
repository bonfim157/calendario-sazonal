import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MessageSchema } from '@/lib/validation'

export async function GET() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ erro: 'Erro ao buscar mensagens' }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { text, from_login, to_login } = parsed.data
    const { data, error } = await supabase
      .from('messages')
      .insert({ text, from_login, to_login: to_login ?? null })
      .select()
      .single()

    if (error) return NextResponse.json({ erro: 'Erro ao enviar mensagem' }, { status: 500 })
    return NextResponse.json({ ok: true, message: data })
  } catch {
    return NextResponse.json({ erro: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
