import { NextResponse } from 'next/server'
import { isConfigured, supabase } from '@/lib/supabase'
import { MessageSchema } from '@/lib/validation'
import getDB from '@/lib/db'

function normalizeMessage(m: any) {
  return {
    id:         m.id,
    text:       m.text,
    from_login: m.from_login ?? m.from ?? '',
    to_login:   m.to_login   ?? m.to   ?? null,
    created_at: m.created_at ?? m.createdAt ?? new Date().toISOString(),
  }
}

export async function GET() {
  if (isConfigured) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ erro: 'Erro ao buscar mensagens' }, { status: 500 })
    return NextResponse.json({ messages: data ?? [] })
  }

  const db = await getDB()
  const messages = ((db.data!.messages as any[]) ?? []).map(normalizeMessage)
  return NextResponse.json({ messages })
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

    if (isConfigured) {
      const { data, error } = await supabase
        .from('messages')
        .insert({ text, from_login, to_login: to_login ?? null })
        .select()
        .single()
      if (error) return NextResponse.json({ erro: 'Erro ao enviar mensagem' }, { status: 500 })
      return NextResponse.json({ ok: true, message: data })
    }

    const db = await getDB()
    const newMsg = {
      id: crypto.randomUUID(),
      text,
      from_login,
      to_login: to_login ?? null,
      created_at: new Date().toISOString(),
    }
    ;(db.data!.messages as any[]).push(newMsg)
    await db.write()
    return NextResponse.json({ ok: true, message: newMsg })
  } catch {
    return NextResponse.json({ erro: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
