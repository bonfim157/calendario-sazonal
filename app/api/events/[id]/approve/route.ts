import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function PUT(req: Request, context: any) {
  const params = (context?.params && typeof context.params.then === 'function') ? await context.params : context.params;
  try {
    const id = params.id;
    const body = await req.json();
    const db = await getDB();
    const ev = db.data!.events.find(e=>e.id === id);
    if(!ev) return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    ev.status = body.status || 'approved';
    ev.aprovadoPor = body.aprovadoPor || 'gestao.escola';
    ev.motivo = body.motivo || '';
    await db.write();
    return NextResponse.json({ ok: true, event: ev });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao aprovar evento' }, { status: 500 });
  }
}
