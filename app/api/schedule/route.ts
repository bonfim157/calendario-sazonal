import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('dia', { ascending: true })
    .order('slot', { ascending: true })

  if (error) return NextResponse.json({ erro: 'Erro ao buscar horários' }, { status: 500 })
  return NextResponse.json({ schedules: data ?? [] })
}
