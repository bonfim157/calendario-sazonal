import { NextResponse } from 'next/server'
import { isConfigured, supabase } from '@/lib/supabase'
import { EventSchema } from '@/lib/validation'
import getDB from '@/lib/db'

function normalizeEvent(ev: any) {
  return {
    id:          ev.id,
    date:        ev.date,
    title:       ev.title,
    category:    ev.category ?? ev.cat ?? 'blue',
    status:      ev.status ?? 'pending',
    nota:        ev.nota ?? null,
    autor_login: ev.autor_login ?? ev.autor ?? null,
  }
}

export async function GET() {
  if (isConfigured) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    if (error) return NextResponse.json({ erro: 'Erro ao buscar eventos' }, { status: 500 })
    return NextResponse.json({ events: data ?? [] })
  }

  const db = await getDB()
  const events = ((db.data!.events as any[]) ?? [])
    .map(normalizeEvent)
    .sort((a, b) => a.date.localeCompare(b.date))
  return NextResponse.json({ events })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = EventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { date, title, category, nota, autor_login } = parsed.data

    if (isConfigured) {
      const { data, error } = await supabase
        .from('events')
        .insert({ date, title, category, nota: nota ?? null, autor_login: autor_login ?? null, status: 'pending' })
        .select()
        .single()
      if (error) return NextResponse.json({ erro: 'Erro ao criar evento' }, { status: 500 })
      return NextResponse.json({ ok: true, event: data })
    }

    const db = await getDB()
    const newEvent = {
      id: crypto.randomUUID(),
      date, title, category,
      nota: nota ?? null,
      autor_login: autor_login ?? null,
      status: 'pending',
    }
    ;(db.data!.events as any[]).push(newEvent)
    await db.write()
    return NextResponse.json({ ok: true, event: newEvent })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar evento' }, { status: 500 })
  }
}
