import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ erro: 'Erro ao buscar eventos' }, { status: 500 })
  return NextResponse.json({ events: data ?? [] })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, title, category, nota, autor_login } = body ?? {}

    if (!date || !title || !category) {
      return NextResponse.json({ erro: 'date, title e category são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('events')
      .insert({ date, title, category, nota: nota ?? null, autor_login: autor_login ?? null, status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ erro: 'Erro ao criar evento' }, { status: 500 })
    return NextResponse.json({ ok: true, event: data })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar evento' }, { status: 500 })
  }
}
