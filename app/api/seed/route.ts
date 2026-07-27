import { NextResponse } from 'next/server'

// Seed removido da Fase 1: dados são inseridos via SQL no Supabase.
// Este endpoint não existe mais em produção.
export async function POST() {
  return NextResponse.json(
    { erro: 'Seed desabilitado. Use o SQL Editor do Supabase para inserir dados.' },
    { status: 403 }
  )
}
