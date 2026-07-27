import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, aprovadoPor, motivo } = body ?? {}

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ erro: 'status deve ser approved ou rejected' }, { status: 400 })
    }

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
  } catch {
    return NextResponse.json({ erro: 'Erro ao aprovar evento' }, { status: 500 })
  }
}
