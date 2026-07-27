import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const body = await req.json()
    const { text, from_login, to_login } = body ?? {}

    if (!text || !from_login) {
      return NextResponse.json({ erro: 'text e from_login são obrigatórios' }, { status: 400 })
    }

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
