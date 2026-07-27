import { NextResponse } from 'next/server'
import { isConfigured, supabase } from '@/lib/supabase'
import getDB from '@/lib/db'

export async function GET() {
  if (isConfigured) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('dia', { ascending: true })
      .order('slot', { ascending: true })
    if (error) return NextResponse.json({ erro: 'Erro ao buscar horários' }, { status: 500 })
    return NextResponse.json({ schedules: data ?? [] })
  }

  const db = await getDB()
  const schedules = ((db.data!.schedules as any[]) ?? [])
    .sort((a, b) => a.dia - b.dia || a.slot - b.slot)
  return NextResponse.json({ schedules })
}
