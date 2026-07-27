import { NextResponse } from 'next/server'
import { isConfigured, supabase } from '@/lib/supabase'
import { ApproveSchema } from '@/lib/validation'
import getDB from '@/lib/db'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => null)
    const parsed = ApproveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { status, aprovadoPor, motivo } = parsed.data

    if (isConfigured) {
      const { data, error } = await supabase
        .from('events')
        .update({
          status,
          approved_by: aprovadoPor ?? null,
          approved_at: new Date().toISOString(),
          motivo: motivo ?? null,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ erro: 'Evento não encontrado' }, { status: 404 })
      return NextResponse.json({ ok: true, event: data })
    }

    const db = await getDB()
    const events = db.data!.events as any[]
    const idx = events.findIndex(e => e.id === id)
    if (idx === -1) return NextResponse.json({ erro: 'Evento não encontrado' }, { status: 404 })
    events[idx] = {
      ...events[idx],
      status,
      approved_by: aprovadoPor ?? null,
      approved_at: new Date().toISOString(),
      motivo: motivo ?? null,
    }
    await db.write()
    return NextResponse.json({ ok: true, event: events[idx] })
  } catch {
    return NextResponse.json({ erro: 'Erro ao aprovar evento' }, { status: 500 })
  }
}
