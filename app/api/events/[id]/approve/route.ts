import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApproveSchema } from '@/lib/validation'

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
